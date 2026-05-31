#include "spice.h"

#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define NEWTON_MAX_ITERS 80
#define NEWTON_TOL 1e-9
#define DIODE_MAX_EXP 40.0

static int matrix_solve(int n, double *a, double *b, double *x) {
    for (int i = 0; i < n; i++) {
        int p = i;
        double max = fabs(a[i * n + i]);
        for (int r = i + 1; r < n; r++) {
            double v = fabs(a[r * n + i]);
            if (v > max) {
                max = v;
                p = r;
            }
        }
        if (max < 1e-18) {
            return -1;
        }

        if (p != i) {
            for (int c = i; c < n; c++) {
                double t = a[i * n + c];
                a[i * n + c] = a[p * n + c];
                a[p * n + c] = t;
            }
            double tb = b[i];
            b[i] = b[p];
            b[p] = tb;
        }

        double piv = a[i * n + i];
        for (int c = i; c < n; c++) {
            a[i * n + c] /= piv;
        }
        b[i] /= piv;

        for (int r = 0; r < n; r++) {
            if (r == i) continue;
            double f = a[r * n + i];
            if (fabs(f) < 1e-24) continue;
            for (int c = i; c < n; c++) {
                a[r * n + c] -= f * a[i * n + c];
            }
            b[r] -= f * b[i];
        }
    }

    for (int i = 0; i < n; i++) {
        x[i] = b[i];
    }
    return 0;
}

static int vindex(int node) {
    return node > 0 ? node - 1 : -1;
}

static void stamp_g(double *a, int n, int ni, int nj, double g) {
    int i = vindex(ni);
    int j = vindex(nj);
    if (i >= 0) a[i * n + i] += g;
    if (j >= 0) a[j * n + j] += g;
    if (i >= 0 && j >= 0) {
        a[i * n + j] -= g;
        a[j * n + i] -= g;
    }
}

static void stamp_i(double *rhs, int ni, int nj, double i) {
    int a = vindex(ni);
    int b = vindex(nj);
    if (a >= 0) rhs[a] -= i;
    if (b >= 0) rhs[b] += i;
}

static void stamp_vsrc(double *a, double *rhs, int n, int ni, int nj, int bidx, double vdc, int node_vars) {
    int br = node_vars + bidx;
    int i = vindex(ni);
    int j = vindex(nj);

    if (i >= 0) {
        a[i * n + br] += 1.0;
        a[br * n + i] += 1.0;
    }
    if (j >= 0) {
        a[j * n + br] -= 1.0;
        a[br * n + j] -= 1.0;
    }
    rhs[br] += vdc;
}

static double node_voltage(const double *x, int node) {
    int idx = vindex(node);
    return idx >= 0 ? x[idx] : 0.0;
}

static void diode_linearize(const DiodeModel *m, double vd, double *gd, double *ieq) {
    double scale = m->n * m->vt;
    double arg = vd / scale;
    if (arg > DIODE_MAX_EXP) arg = DIODE_MAX_EXP;
    if (arg < -DIODE_MAX_EXP) arg = -DIODE_MAX_EXP;

    double expv = exp(arg);
    double id = m->is * (expv - 1.0);
    *gd = m->is * expv / scale;
    *ieq = id - (*gd) * vd;
}

static void build_system(const Circuit *ckt,
                         const double *x_prev,
                         const double *cap_prev_v,
                         double dt,
                         int is_tran,
                         double *a,
                         double *rhs) {
    int node_vars = ckt->node_count - 1;
    int n = node_vars + ckt->vsource_count;

    memset(a, 0, (size_t)n * (size_t)n * sizeof(double));
    memset(rhs, 0, (size_t)n * sizeof(double));

    for (int i = 0; i < ckt->element_count; i++) {
        const Element *e = &ckt->elements[i];
        switch (e->type) {
            case ELEM_RESISTOR:
                if (e->value > 0) {
                    stamp_g(a, n, e->n1, e->n2, 1.0 / e->value);
                }
                break;
            case ELEM_ISOURCE:
                stamp_i(rhs, e->n1, e->n2, e->value);
                break;
            case ELEM_VSOURCE:
                stamp_vsrc(a, rhs, n, e->n1, e->n2, e->branch_index, e->value, node_vars);
                break;
            case ELEM_CAPACITOR:
                if (is_tran && dt > 0 && e->value > 0) {
                    double g = e->value / dt;
                    stamp_g(a, n, e->n1, e->n2, g);
                    stamp_i(rhs, e->n1, e->n2, -g * cap_prev_v[i]);
                }
                break;
            case ELEM_DIODE:
                if (e->model_index >= 0) {
                    double vd = node_voltage(x_prev, e->n1) - node_voltage(x_prev, e->n2);
                    double gd = 0.0, ieq = 0.0;
                    diode_linearize(&ckt->models[e->model_index], vd, &gd, &ieq);
                    stamp_g(a, n, e->n1, e->n2, gd);
                    stamp_i(rhs, e->n1, e->n2, ieq);
                }
                break;
            default:
                break;
        }
    }

    for (int d = 0; d < node_vars; d++) {
        a[d * n + d] += 1e-12;
    }
}

static int solve_nonlinear(const Circuit *ckt,
                           double *x,
                           const double *cap_prev_v,
                           double dt,
                           int is_tran) {
    int n = (ckt->node_count - 1) + ckt->vsource_count;
    double *a = (double *)malloc((size_t)n * (size_t)n * sizeof(double));
    double *rhs = (double *)malloc((size_t)n * sizeof(double));
    double *next = (double *)malloc((size_t)n * sizeof(double));
    if (!a || !rhs || !next) {
        free(a);
        free(rhs);
        free(next);
        return -1;
    }

    for (int iter = 0; iter < NEWTON_MAX_ITERS; iter++) {
        build_system(ckt, x, cap_prev_v, dt, is_tran, a, rhs);
        if (matrix_solve(n, a, rhs, next) != 0) {
            free(a);
            free(rhs);
            free(next);
            return -1;
        }

        double max_delta = 0.0;
        for (int i = 0; i < n; i++) {
            double delta = fabs(next[i] - x[i]);
            if (delta > max_delta) {
                max_delta = delta;
            }
            x[i] = next[i];
        }

        if (max_delta < NEWTON_TOL) {
            free(a);
            free(rhs);
            free(next);
            return 0;
        }
    }

    free(a);
    free(rhs);
    free(next);
    return -1;
}

static void print_op(const Circuit *ckt, const double *x) {
    printf("# OP\n");
    for (int i = 1; i < ckt->node_count; i++) {
        printf("V(%s)=%.9g\n", ckt->node_names[i], x[i - 1]);
    }

    int node_vars = ckt->node_count - 1;
    for (int i = 0; i < ckt->element_count; i++) {
        const Element *e = &ckt->elements[i];
        if (e->type == ELEM_VSOURCE) {
            printf("I(%s)=%.9g\n", e->name, x[node_vars + e->branch_index]);
        }
    }
}

static void print_tran_header(const Circuit *ckt) {
    printf("# TRAN\n");
    printf("time");
    for (int i = 1; i < ckt->node_count; i++) {
        printf(",V(%s)", ckt->node_names[i]);
    }
    printf("\n");
}

static void print_tran_row(const Circuit *ckt, double t, const double *x) {
    printf("%.9g", t);
    for (int i = 1; i < ckt->node_count; i++) {
        printf(",%.9g", x[i - 1]);
    }
    printf("\n");
}

int spice_run(const Circuit *ckt, bool print_header, char *err, int err_len) {
    int n = (ckt->node_count - 1) + ckt->vsource_count;
    if (n <= 0) {
        snprintf(err, (size_t)err_len, "empty circuit");
        return -1;
    }

    double *x = (double *)calloc((size_t)n, sizeof(double));
    double *cap_prev_v = (double *)calloc((size_t)ckt->element_count, sizeof(double));
    if (!x || !cap_prev_v) {
        snprintf(err, (size_t)err_len, "out of memory");
        free(x);
        free(cap_prev_v);
        return -1;
    }

    if (ckt->analysis.do_op) {
        if (solve_nonlinear(ckt, x, cap_prev_v, 0.0, 0) != 0) {
            snprintf(err, (size_t)err_len, "DC operating point failed to converge");
            free(x);
            free(cap_prev_v);
            return -1;
        }
        if (print_header) {
            print_op(ckt, x);
        }
    }

    if (ckt->analysis.do_tran) {
        if (ckt->analysis.tran_step <= 0 || ckt->analysis.tran_stop <= 0) {
            snprintf(err, (size_t)err_len, "invalid transient setup");
            free(x);
            free(cap_prev_v);
            return -1;
        }

        if (print_header) {
            print_tran_header(ckt);
        }
        print_tran_row(ckt, 0.0, x);

        int steps = (int)floor(ckt->analysis.tran_stop / ckt->analysis.tran_step + 1e-12);
        for (int s = 1; s <= steps; s++) {
            for (int i = 0; i < ckt->element_count; i++) {
                if (ckt->elements[i].type == ELEM_CAPACITOR) {
                    cap_prev_v[i] = node_voltage(x, ckt->elements[i].n1) - node_voltage(x, ckt->elements[i].n2);
                }
            }

            if (solve_nonlinear(ckt, x, cap_prev_v, ckt->analysis.tran_step, 1) != 0) {
                snprintf(err, (size_t)err_len, "transient solve failed at step %d", s);
                free(x);
                free(cap_prev_v);
                return -1;
            }

            print_tran_row(ckt, s * ckt->analysis.tran_step, x);
        }
    }

    free(x);
    free(cap_prev_v);
    return 0;
}

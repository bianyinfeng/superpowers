#include "spice.h"

#include <ctype.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void set_error(char *err, int err_len, const char *msg) {
    if (err && err_len > 0) {
        snprintf(err, (size_t)err_len, "%s", msg);
    }
}

static char *trim(char *s) {
    while (isspace((unsigned char)*s)) {
        s++;
    }
    if (*s == '\0') {
        return s;
    }
    char *end = s + strlen(s) - 1;
    while (end > s && isspace((unsigned char)*end)) {
        *end-- = '\0';
    }
    return s;
}

static int is_ground(const char *name) {
    return strcmp(name, "0") == 0 || strcasecmp(name, "gnd") == 0;
}

static int node_index(Circuit *ckt, const char *name, char *err, int err_len) {
    if (is_ground(name)) {
        return 0;
    }
    for (int i = 1; i < ckt->node_count; i++) {
        if (strcmp(ckt->node_names[i], name) == 0) {
            return i;
        }
    }
    if (ckt->node_count >= SPICE_MAX_NODES) {
        set_error(err, err_len, "node limit exceeded");
        return -1;
    }
    snprintf(ckt->node_names[ckt->node_count], SPICE_NAME_LEN, "%s", name);
    return ckt->node_count++;
}

static double parse_value(const char *s) {
    char *end = NULL;
    double v = strtod(s, &end);
    if (!end || *end == '\0') {
        return v;
    }
    if (strcasecmp(end, "t") == 0) return v * 1e12;
    if (strcasecmp(end, "g") == 0) return v * 1e9;
    if (strcasecmp(end, "meg") == 0) return v * 1e6;
    if (strcasecmp(end, "k") == 0) return v * 1e3;
    if (strcasecmp(end, "m") == 0) return v * 1e-3;
    if (strcasecmp(end, "u") == 0) return v * 1e-6;
    if (strcasecmp(end, "n") == 0) return v * 1e-9;
    if (strcasecmp(end, "p") == 0) return v * 1e-12;
    if (strcasecmp(end, "f") == 0) return v * 1e-15;
    return v;
}

static int add_model(Circuit *ckt, const char *name, double is, double n, double vt,
                     char *err, int err_len) {
    if (ckt->model_count >= SPICE_MAX_MODELS) {
        set_error(err, err_len, "model limit exceeded");
        return -1;
    }
    int idx = ckt->model_count++;
    DiodeModel *m = &ckt->models[idx];
    snprintf(m->name, SPICE_NAME_LEN, "%s", name);
    m->is = is;
    m->n = n;
    m->vt = vt;
    return idx;
}

static int find_model(const Circuit *ckt, const char *name) {
    for (int i = 0; i < ckt->model_count; i++) {
        if (strcmp(ckt->models[i].name, name) == 0) {
            return i;
        }
    }
    return -1;
}

static int parse_model(Circuit *ckt, char *line, char *err, int err_len) {
    char *tok = strtok(line, " \t");
    if (!tok || strcasecmp(tok, ".model") != 0) {
        set_error(err, err_len, "invalid .model");
        return -1;
    }

    char *name = strtok(NULL, " \t");
    char *type = strtok(NULL, " \t");
    if (!name || !type || strcasecmp(type, "d") != 0) {
        set_error(err, err_len, "only diode model is supported");
        return -1;
    }

    double is = 1e-14;
    double n = 1.0;
    double vt = 0.02585;

    for (char *p = strtok(NULL, " \t"); p; p = strtok(NULL, " \t")) {
        if (strncasecmp(p, "IS=", 3) == 0) {
            is = parse_value(p + 3);
        } else if (strncasecmp(p, "N=", 2) == 0) {
            n = parse_value(p + 2);
        } else if (strncasecmp(p, "VT=", 3) == 0) {
            vt = parse_value(p + 3);
        }
    }

    return add_model(ckt, name, is, n, vt, err, err_len) >= 0 ? 0 : -1;
}

static int add_element(Circuit *ckt, Element *elem, char *err, int err_len) {
    if (ckt->element_count >= SPICE_MAX_ELEMENTS) {
        set_error(err, err_len, "element limit exceeded");
        return -1;
    }
    ckt->elements[ckt->element_count++] = *elem;
    return 0;
}

static int parse_element(Circuit *ckt, char *line, char *err, int err_len) {
    char raw[SPICE_NAME_LEN] = {0};
    char n1[SPICE_NAME_LEN] = {0};
    char n2[SPICE_NAME_LEN] = {0};
    char tail[SPICE_NAME_LEN] = {0};

    if (sscanf(line, "%31s %31s %31s %31s", raw, n1, n2, tail) < 4) {
        set_error(err, err_len, "invalid element syntax");
        return -1;
    }

    int ni = node_index(ckt, n1, err, err_len);
    if (ni < 0) return -1;
    int nj = node_index(ckt, n2, err, err_len);
    if (nj < 0) return -1;

    Element e;
    memset(&e, 0, sizeof(e));
    snprintf(e.name, SPICE_NAME_LEN, "%s", raw);
    e.n1 = ni;
    e.n2 = nj;
    e.model_index = -1;

    switch (toupper((unsigned char)raw[0])) {
        case 'R':
            e.type = ELEM_RESISTOR;
            e.value = parse_value(tail);
            break;
        case 'C':
            e.type = ELEM_CAPACITOR;
            e.value = parse_value(tail);
            break;
        case 'I':
            e.type = ELEM_ISOURCE;
            e.value = parse_value(tail);
            break;
        case 'V':
            e.type = ELEM_VSOURCE;
            e.value = parse_value(tail);
            e.branch_index = ckt->vsource_count++;
            break;
        case 'D':
            e.type = ELEM_DIODE;
            e.model_index = find_model(ckt, tail);
            if (e.model_index < 0) {
                set_error(err, err_len, "unknown diode model");
                return -1;
            }
            break;
        default:
            set_error(err, err_len, "unsupported element type");
            return -1;
    }

    return add_element(ckt, &e, err, err_len);
}

int spice_parse_netlist(const char *path, Circuit *ckt, char *err, int err_len) {
    FILE *fp = fopen(path, "r");
    if (!fp) {
        set_error(err, err_len, "failed to open netlist file");
        return -1;
    }

    memset(ckt, 0, sizeof(*ckt));
    ckt->node_count = 1;
    snprintf(ckt->node_names[0], SPICE_NAME_LEN, "0");

    char buf[512];
    int line_no = 0;
    while (fgets(buf, sizeof(buf), fp)) {
        line_no++;
        char *line = trim(buf);
        if (*line == '\0' || *line == '*' || *line == ';') {
            continue;
        }

        if (line[0] == '.') {
            if (strncasecmp(line, ".op", 3) == 0) {
                ckt->analysis.do_op = true;
                continue;
            }
            if (strncasecmp(line, ".tran", 5) == 0) {
                char step[SPICE_NAME_LEN] = {0};
                char stop[SPICE_NAME_LEN] = {0};
                if (sscanf(line, ".tran %31s %31s", step, stop) != 2) {
                    set_error(err, err_len, "invalid .tran syntax");
                    fclose(fp);
                    return -1;
                }
                ckt->analysis.do_tran = true;
                ckt->analysis.tran_step = parse_value(step);
                ckt->analysis.tran_stop = parse_value(stop);
                continue;
            }
            if (strncasecmp(line, ".model", 6) == 0) {
                char copy[512];
                snprintf(copy, sizeof(copy), "%s", line);
                if (parse_model(ckt, copy, err, err_len) != 0) {
                    fclose(fp);
                    return -1;
                }
                continue;
            }
            if (strncasecmp(line, ".end", 4) == 0) {
                break;
            }
            set_error(err, err_len, "unsupported control statement");
            fclose(fp);
            return -1;
        }

        char copy[512];
        snprintf(copy, sizeof(copy), "%s", line);
        if (parse_element(ckt, copy, err, err_len) != 0) {
            char wrapped[256];
            snprintf(wrapped, sizeof(wrapped), "line %d: %s", line_no, err ? err : "parse error");
            set_error(err, err_len, wrapped);
            fclose(fp);
            return -1;
        }
    }

    fclose(fp);

    if (!ckt->analysis.do_op && !ckt->analysis.do_tran) {
        ckt->analysis.do_op = true;
    }

    return 0;
}

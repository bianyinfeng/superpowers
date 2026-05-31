#ifndef SPICE_H
#define SPICE_H

#include <stdbool.h>

#define SPICE_MAX_NODES 128
#define SPICE_MAX_ELEMENTS 512
#define SPICE_MAX_MODELS 128
#define SPICE_NAME_LEN 32

typedef enum {
    ELEM_RESISTOR,
    ELEM_CAPACITOR,
    ELEM_ISOURCE,
    ELEM_VSOURCE,
    ELEM_DIODE
} ElementType;

typedef struct {
    char name[SPICE_NAME_LEN];
    double is;
    double n;
    double vt;
} DiodeModel;

typedef struct {
    ElementType type;
    char name[SPICE_NAME_LEN];
    int n1;
    int n2;
    double value;
    int model_index;
    int branch_index;
    double state;
} Element;

typedef struct {
    bool do_op;
    bool do_tran;
    double tran_step;
    double tran_stop;
} AnalysisConfig;

typedef struct {
    int node_count;
    char node_names[SPICE_MAX_NODES][SPICE_NAME_LEN];

    int element_count;
    Element elements[SPICE_MAX_ELEMENTS];

    int model_count;
    DiodeModel models[SPICE_MAX_MODELS];

    int vsource_count;

    AnalysisConfig analysis;
} Circuit;

typedef struct {
    int size;
    double *x;
} Solution;

int spice_parse_netlist(const char *path, Circuit *ckt, char *err, int err_len);
int spice_run(const Circuit *ckt, bool print_header, char *err, int err_len);

#endif

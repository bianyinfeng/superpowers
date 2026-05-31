#include "spice.h"

#include <stdio.h>

int main(int argc, char **argv) {
    if (argc < 2) {
        fprintf(stderr, "Usage: %s <netlist.cir>\n", argv[0]);
        return 1;
    }

    Circuit ckt;
    char err[256] = {0};

    if (spice_parse_netlist(argv[1], &ckt, err, (int)sizeof(err)) != 0) {
        fprintf(stderr, "Parse error: %s\n", err);
        return 2;
    }

    if (spice_run(&ckt, true, err, (int)sizeof(err)) != 0) {
        fprintf(stderr, "Simulation error: %s\n", err);
        return 3;
    }

    return 0;
}

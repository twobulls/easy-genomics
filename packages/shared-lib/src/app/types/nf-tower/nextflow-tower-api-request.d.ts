import { z } from "zod";
import { NextFlowTowerApiRequestSchema } from "../../schema/nf-tower/nextflow-tower-api-request";

export type NextflowTowerApiRequest = z.infer<typeof NextFlowTowerApiRequestSchema>;
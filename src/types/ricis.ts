export type PhaseId = -1 | 0 | 0.5 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PhaseStep {
  phase: PhaseId;
  name: string;
  ruleApplied: string;
  latexInput: string;
  latexOutput: string;
  explanationRu: string;
  explanationEn: string;
  axiomOrProtocol?: string;
  status: 'passed' | 'warning' | 'transformed' | 'verified';
}

export interface RicisMonad {
  kind: 'scalar' | 'zero' | 'infinity' | 'monolith';
  value?: number;
  origin?: string; // The generating index F or E(x)
  latexRepresentation: string;
  typeTag?: string;
  order?: 0 | 1 | 2 | 3; // For monoliths
}

export interface CalculationResult {
  rawExpression: string;
  variableContext?: Record<string, number | string>;
  phases: PhaseStep[];
  finalResult: {
    latex: string;
    text: string;
    kind: string;
    typeTag: string;
  };
  classicalFailure: {
    result: string;
    reasonRu: string;
    reasonEn: string;
  };
  leanCode: string;
}

export interface ProblemTask {
  id: string;
  titleRu: string;
  titleEn: string;
  category: 'Millennium' | 'IndeterminateForms' | 'DeepLearning' | 'Decipherment' | 'MonolithGeometry' | 'AxiomsVerification';
  doi?: string;
  zenodoUrl?: string;
  descriptionRu: string;
  descriptionEn: string;
  expression: string;
  variableContext?: Record<string, number | string>;
  expectedResultLatex: string;
  solutionStepsRu: string[];
  leanTheorem: string;
}

export interface PublicationDOI {
  titleRu: string;
  titleEn: string;
  doi: string;
  zenodoUrl: string;
  descriptionRu: string;
  author: string;
  orcid: string;
}

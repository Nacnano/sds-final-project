export interface Technique {
  id: string;
  shrineId: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
}

export class CreateTechniqueDto {
  shrineId: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
}

export class UpdateTechniqueDto {
  title: string;
  description: string;
  ingredients: string[];
}

export class TechniqueResponseDto {
  technique: Technique;
}

export class TechniquesResponseDto {
  techniques: Technique[];
}

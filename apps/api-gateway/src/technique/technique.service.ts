import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import type { ClientGrpc } from '@nestjs/microservices';
import { catchError, mergeMap, Observable, map } from 'rxjs';
import { AxiosResponse } from 'axios';
import type { ShrineServiceClient } from '@app/shared/interfaces/shrine';

// Technique DTOs
interface Technique {
  id: string;
  shrineId: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
}

interface CreateTechniqueRequest {
  shrineId: string;
  userId: string;
  title: string;
  description: string;
  ingredients: string[];
}

interface UpdateTechniqueRequest {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
}

interface TechniqueResponse {
  technique: Technique | undefined;
}

interface TechniquesResponse {
  techniques: Technique[];
}

@Injectable()
export class TechniqueService implements OnModuleInit {
  private shrineClientService: ShrineServiceClient;
  private techniqueServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @Inject('SHRINE_PACKAGE') private readonly shrineClient: ClientGrpc,
  ) {
    this.techniqueServiceUrl = this.configService.get<string>(
      'TECHNIQUE_SERVICE_URL',
      'http://localhost:5002',
    );
  }

  onModuleInit() {
    this.shrineClientService =
      this.shrineClient.getService<ShrineServiceClient>('ShrineService');
  }

  createTechnique(
    createTechniqueRequest: Omit<CreateTechniqueRequest, 'userId'>,
  ): Observable<TechniqueResponse> {
    const requestWithUser = {
      ...createTechniqueRequest,
      userId: 'default-user',
    }; // TODO: Implement user authentication

    // check if shrine exists before calling technique service
    return this.shrineClientService
      .findShrineById({ id: createTechniqueRequest.shrineId })
      .pipe(
        mergeMap(() =>
          this.httpService
            .post<TechniqueResponse>(
              `${this.techniqueServiceUrl}/techniques`,
              requestWithUser,
            )
            .pipe(map((response: AxiosResponse<TechniqueResponse>) => response.data)),
        ),
      );
  }

  findTechniqueById(id: string): Observable<TechniqueResponse> {
    return this.httpService
      .get<TechniqueResponse>(`${this.techniqueServiceUrl}/techniques/${id}`)
      .pipe(map((response: AxiosResponse<TechniqueResponse>) => response.data));
  }

  listTechniques(): Observable<TechniquesResponse> {
    return this.httpService
      .get<TechniquesResponse>(`${this.techniqueServiceUrl}/techniques`)
      .pipe(map((response: AxiosResponse<TechniquesResponse>) => response.data));
  }

  updateTechnique(
    id: string,
    updateTechniqueRequest: Omit<UpdateTechniqueRequest, 'id'>,
  ): Observable<TechniqueResponse> {
    return this.httpService
      .patch<TechniqueResponse>(
        `${this.techniqueServiceUrl}/techniques/${id}`,
        updateTechniqueRequest,
      )
      .pipe(map((response: AxiosResponse<TechniqueResponse>) => response.data));
  }

  deleteTechnique(id: string): Observable<TechniqueResponse> {
    return this.httpService
      .delete<TechniqueResponse>(`${this.techniqueServiceUrl}/techniques/${id}`)
      .pipe(map((response: AxiosResponse<TechniqueResponse>) => response.data));
  }
}

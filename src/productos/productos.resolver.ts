import { Resolver, Query, Args, Int, Float } from '@nestjs/graphql';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Producto } from './producto.model.js';
import { DATOS_PRUEBA } from './datos-prueba.js';

const API_URL = 'https://nestjs-productos-api.onrender.com/api/v1/productos';

// Con USAR_DATOS_PRUEBA=true las queries usan 10.000 productos generados en memoria en vez de la API REST.
const USAR_DATOS_PRUEBA = process.env.USAR_DATOS_PRUEBA === 'true';

@Resolver(() => Producto)
export class ProductosResolver {
  constructor(private readonly http: HttpService) {}

  private async obtenerTodos(): Promise<Producto[]> {
    if (USAR_DATOS_PRUEBA) return DATOS_PRUEBA;
    const { data } = await firstValueFrom(this.http.get<Producto[]>(API_URL));
    return data;
  }

  @Query(() => [Producto])
  async productos(): Promise<Producto[]> {
    return this.obtenerTodos();
  }

  @Query(() => Producto, { nullable: true })
  async productoPorId(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Producto | undefined> {
    if (USAR_DATOS_PRUEBA) return DATOS_PRUEBA.find((p) => p.id === id);
    const { data } = await firstValueFrom(this.http.get<Producto>(`${API_URL}/${id}`));
    return data;
  }

  @Query(() => [Producto])
  async productosBaratos(
    @Args('precioMaximo', { type: () => Float }) precioMaximo: number,
  ): Promise<Producto[]> {
    const todos = await this.obtenerTodos();
    return todos.filter((p) => p.precio <= precioMaximo);
  }
}

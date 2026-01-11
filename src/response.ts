import { JsonObject } from './json/decorators/json-object';
import { JsonProperty } from './json/decorators/json-property';

@JsonObject()
export class ApiResponse {
    @JsonProperty('numero')
    public id: number = 0;

    @JsonProperty('listaDezenas', { arrayType: 'string' })
    public numbers: string[];
}

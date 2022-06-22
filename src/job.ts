import {RunnerOption} from './runner'
export interface JobOption {
  id: string
  status: string
  runner?: RunnerOption
}

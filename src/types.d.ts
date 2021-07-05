export interface Configuration {
    dispatch: any,
    services: [],
}

export interface ServiceConfiguration {
    service: string,
    path: string,
    routes: [],
    runtime: string,
    colorStyle: any,
}

export type LooseObject = {
  [key: string] : any
}

export type PortMap = {
  index: number,
  PORT: number,
}

export interface GilbertConfiguartion {
  configFilePath?: string,
  configFile?:Configuration,
  port?: number,
  portMapping?: {[key:string] : PortMap},
  serviceMap?: LooseObject,
}

export interface ExecutionResult {
  success: boolean,
  msg?: string,
}

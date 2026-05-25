declare module 'sequelize' {
  export class Sequelize {
    constructor(options: any);
    define(modelName: string, attributes: any, options?: any): any;
    getQueryInterface(): Promise<any>;
  }
  export const DataTypes: any;
}

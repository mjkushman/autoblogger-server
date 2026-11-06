import { Model, ModelStatic } from "sequelize";

/** A Sequelize model that may define an associate() method, called once all models exist */
export type AppModel = ModelStatic<Model> & {
  associate?: (models: Models) => void;
};

export type Models = Record<string, any>;

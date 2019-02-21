declare module "draft-katex" {
    interface IPlugin {
        decorator(): void;
        insertFormula(formula?: string, openImmediately = false): void;
    }

    interface ITheme {
        tex: object;
        activeTex: object;
        panel: object;
        texValue: object;
        buttons: object;
        saveButton: object;
        removeButton: object;
        invalidButton: object;
        insertButton: object;
    }

    interface IConfig {
        katex: any;
        theme?: ITheme;
    }

    export function createKaTeXPlugin(config: IConfig): IPlugin;
}

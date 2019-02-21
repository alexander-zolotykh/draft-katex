declare module "draft-katex" {
    import { EditorState } from "draft-js";

    interface IPlugin {
        decorator(): void;
        insertFormula(formula?: string, providedEditorState?: EditorState, openImmediately = false): void;
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

import IsolatedVM from "isolated-vm";

class IsolatedVMWrapper {
    constructor(code) {
        this.isolate = new IsolatedVM.Isolate();
        this.context = this.isolate.createContextSync();
        this.script = null;

        try {
            this.script = this.isolate.compileScriptSync(code);
        } catch (error) {
            throw new Error(`Compiltion Error: ${error.message}`);
        }
    }

    run() {
        try {
            return this.script.runSync(this.context);
        } catch (error) {
            throw new Error(`Execution Error: ${error.message}`);
        }
    }
}

export { IsolatedVMWrapper };
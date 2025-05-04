import ivm from 'isolated-vm';

class IsolatedVMWrapper {
    constructor(code) {
      this.isolate = new ivm.Isolate({ memoryLimit: 256 });
      this.context = this.isolate.createContextSync();
      this.logs = []; // Store console.log output
      const jail = this.context.global;
  
      jail.setSync('globalThis', jail.derefInto());
  
      jail.setSync('console', {
        log: new ivm.Reference((...args) => {
          const logMessage = args.join(' ');
          this.logs.push(logMessage); // Collect logs
          console.log("[Isolated VM]", ...args); // Still log to host
        }),
      });
  
      jail.setSync('setTimeout', new ivm.Reference((fnRef, delay) => {
        setTimeout(() => {
          fnRef.apply(undefined, [], { arguments: { copy: true } }).catch(console.error);
        }, delay);
      }));
  
      this.code = code;
      this.script = null;
  
      try {
        this.script = this.isolate.compileScriptSync(code);
      } catch (err) {
        throw new Error(`Compilation Error: ${err.message}`);
      }
    }
  
    async run() {
      try {
        const result = await this.script.run(this.context, { timeout: 10000 });
        let finalResult = result;
        if (result && typeof result.copy === 'function') {
          finalResult = await result.copy();
        }
        return { result: finalResult, logs: this.logs }; // Return both result and logs
      } catch (err) {
        throw new Error(`Execution Error: ${err.message}`);
      }
    }
  }


  export { IsolatedVMWrapper };
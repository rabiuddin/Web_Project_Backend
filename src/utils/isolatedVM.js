import ivm from 'isolated-vm';

class IsolatedVMWrapper {
  constructor(code) {
    this.isolate = new ivm.Isolate({ memoryLimit: 256 });
    this.context = this.isolate.createContextSync();
    const jail = this.context.global;

    // Create a log array INSIDE the isolate's context
    jail.setSync('__logs__', []);

    // Install console.log implementation directly in the VM
    const setupScript = this.isolate.compileScriptSync(`
      console.log = (...args) => {
        __logs__.push(
          args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' ')
        );
      };
    `);
    setupScript.runSync(this.context);

    // Set up setTimeout using the isolate's own environment
    jail.setSync('setTimeout', new ivm.Reference((fnRef, delay) => {
      setTimeout(() => {
        fnRef.apply(undefined, [], { arguments: { copy: true } }).catch(console.error);
      }, delay);
    }));

    // Compile user code
    try {
      this.script = this.isolate.compileScriptSync(code);
    } catch (err) {
      throw new Error(`Compilation Error: ${err.message}`);
    }
  }

  async run() {
    try {
      const result = await this.script.run(this.context, { timeout: 10000 });
      
      // Retrieve logs from the isolate's context
      const logsReference = await this.context.global.get('__logs__');
      const logs = await logsReference.copy();
      
      return { 
        result: typeof result === 'undefined' ? null : result,
        logs: logs || []
      };
    } catch (err) {
      throw new Error(`Execution Error: ${err.message}`);
    }
  }
  destroy() {
    this.isolate.dispose();
  }
}

export { IsolatedVMWrapper };
import Dispatcher from './Dispatcher';
import Logger from './Logger';

class Maestro extends Dispatcher {
  _linkedInstances = [];

  flowClasses = {};
  flows = {};
  helpers = {};
  managers = {};

  constructor(options = {}) {
    super();

    const { flowClasses, helperClasses, managerClasses } = options;

    if (flowClasses) {
      flowClasses.forEach(FlowClass => {
        this.flowClasses[FlowClass.name] = FlowClass;
      });
    }

    if (helperClasses) {
      helperClasses.forEach(HelperClass => {
        this.helpers[HelperClass.name] = new HelperClass(this);
      });
    }

    if (managerClasses) {
      managerClasses.forEach(ManagerClass => {
        this.managers[ManagerClass.name] = new ManagerClass(this);
      });
    }

    this.syncManagersWithStore();
  }

  startFlow(flowName, data) {
    const flow = new this.flowClasses[flowName](this);

    Logger.log([
      `Starting flow: ${flowName}`,
      'With data:',
      data,
    ]);

    flow.start(data);

    this.flows[flowName] = flow;
  }

  progressFlow(flowName, data) {
    const flow = this.flows[flowName];

    Logger.log([
      `Progressing flow: ${flowName}`,
      'With data:',
      data,
    ]);

    if (flow) {
      flow.progress(data);
    }
  }

  finishFlow(flowName, data) {
    const flow = this.flows[flowName];

    Logger.log([
      `Finishing flow: ${flowName}`,
      'With data:',
      data,
    ]);

    if (flow) {
      flow.finish(data);
    }
  }

  linkToFlow(flowName, classInstance) {
    const flow = this.flows[flowName];

    Logger.log([
      `Linking class instance to flow: ${flowName}`,
      'Class instance:',
      classInstance,
    ]);

    if (flow) {
      flow.link(classInstance);
    }
  }

  unlinkFromFlow(flowName, classInstance) {
    const flow = this.flows[flowName];

    Logger.log([
      `Unlinking class instance from flow: ${flowName}`,
      'Class instance:',
      classInstance,
    ]);

    if (flow) {
      flow.unlink(classInstance);
    }
  }

  dispatchStoreUpdate() {
    this.syncManagersWithStore();
    super.dispatchStoreUpdate();

    Logger.log([
      `Dispatched GLOBAL store update`,
      'New store:',
      this.store,
      'Available to linked instances:',
      this._linkedInstances,
    ]);
  }

  syncManagersWithStore() {
    const storeUpdate = {};

    Object.values(this.managers).forEach(manager => {
      storeUpdate[manager.storeName] = manager._store.getData();
    });

    this._store.update(storeUpdate);
  }
}

export default Maestro;

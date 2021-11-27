import ApplicationInstance from '@ember/application/instance';

export function initialize(appInstance: ApplicationInstance): void {
  appInstance.lookup('service:tracked-effects');
}

export default {
  initialize
};

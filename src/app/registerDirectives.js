import { vMaska } from 'maska/vue';
import { buttonWaveDirective } from './directives/buttonWave';
import { revealDirective } from './directives/reveal';

export function registerAppDirectives(app) {
  app.directive('maska', vMaska);
  app.directive('button-wave', buttonWaveDirective);
  app.directive('reveal', revealDirective);
}

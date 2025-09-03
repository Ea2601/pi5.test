export interface AutomationRule {
  id: string;
  name: string;
  enabled: boolean;
  triggers: string[];
  actions: string[];
  lastExecuted?: Date;
}
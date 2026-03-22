import { phaserEvents, PhaserEvent } from "../events/eventManager";
import dialogues from "./dialogues.json";

export interface DialogueChoice {
  label: string;
  next: string;
}

export interface DialogueNode {
  text: string;
  choices: DialogueChoice[];
  action?: string;
}

export interface DialoguePayload {
  text: string;
  choices: DialogueChoice[];
}

export interface DialogueNavigatePayload {
  selectedIndex: number;
}

type DialogueData = {
  start: string;
  nodes: Record<string, DialogueNode>;
};

export class DialogueManager {
  private activeNpcId: string | null = null;
  private dialogueOpen: boolean = false;
  private currentNode: DialogueNode | null = null;
  private selectedChoiceIndex: number = 0;

  enterZone(npcId: string) {
    if (this.activeNpcId === npcId) return;
    this.activeNpcId = npcId;
    phaserEvents.emit(PhaserEvent.DIALOGUE_ZONE_ENTER, npcId);
  }

  leaveZone() {
    if (!this.activeNpcId) return;
    if (this.dialogueOpen) this.close();
    this.activeNpcId = null;
    phaserEvents.emit(PhaserEvent.DIALOGUE_ZONE_LEAVE);
  }

  open() {
    if (!this.activeNpcId || this.dialogueOpen) return;
    const data = (dialogues as Record<string, DialogueData>)[this.activeNpcId];
    if (!data) return;
    this.dialogueOpen = true;
    this._goToNode(data.nodes[data.start], PhaserEvent.DIALOGUE_OPEN);
  }

  // Called when player presses Enter
  confirm() {
    if (!this.dialogueOpen || !this.currentNode) return;
    const { choices } = this.currentNode;

    // Leaf node (no choices) → close
    if (!choices || choices.length === 0) {
      this.close();
      return;
    }

    // Navigate to the selected choice's next node
    const chosen = choices[this.selectedChoiceIndex];
    const data = (dialogues as Record<string, DialogueData>)[this.activeNpcId!];
    const nextNode = data?.nodes[chosen.next];
    if (!nextNode) { this.close(); return; }

    this._goToNode(nextNode, PhaserEvent.DIALOGUE_UPDATE);
  }

  navigateUp() {
    if (!this.dialogueOpen || !this.currentNode?.choices?.length) return;
    this.selectedChoiceIndex =
      (this.selectedChoiceIndex - 1 + this.currentNode.choices.length) %
      this.currentNode.choices.length;
    phaserEvents.emit(PhaserEvent.DIALOGUE_NAVIGATE, {
      selectedIndex: this.selectedChoiceIndex,
    } satisfies DialogueNavigatePayload);
  }

  navigateDown() {
    if (!this.dialogueOpen || !this.currentNode?.choices?.length) return;
    this.selectedChoiceIndex =
      (this.selectedChoiceIndex + 1) % this.currentNode.choices.length;
    phaserEvents.emit(PhaserEvent.DIALOGUE_NAVIGATE, {
      selectedIndex: this.selectedChoiceIndex,
    } satisfies DialogueNavigatePayload);
  }

  close() {
    if (!this.dialogueOpen) return;
    this.dialogueOpen = false;
    this.currentNode = null;
    this.selectedChoiceIndex = 0;
    phaserEvents.emit(PhaserEvent.DIALOGUE_CLOSE);
  }

  getCurrentAction(): string | undefined {
    return this.currentNode?.action;
  }

  isOpen() { return this.dialogueOpen; }
  isInZone() { return this.activeNpcId !== null; }

  private _goToNode(node: DialogueNode, event: PhaserEvent) {
    // Empty leaf node — close silently without showing the box
    if (!node.text && (!node.choices || node.choices.length === 0)) {
      this.close();
      return;
    }
    this.currentNode = node;
    this.selectedChoiceIndex = 0;
    phaserEvents.emit(event, {
      text: node.text,
      choices: node.choices ?? [],
    } satisfies DialoguePayload);
    if (node.action) {
      phaserEvents.emit(PhaserEvent.DIALOGUE_ACTION, node.action);
    }
  }
}

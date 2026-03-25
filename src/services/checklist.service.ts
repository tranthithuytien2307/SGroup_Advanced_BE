import checklistModel from "../model/checklist.model";
import cardModel from "../model/card.model";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  ErrorResponse,
} from "../handler/error.response";
import { Checklist } from "../entities/checklist.entity";

class ChecklistService {
  async createChecklist(card_id: number, title: string) {
    try {
      const card = await cardModel.getById(card_id);
      if (!card) {
        throw new NotFoundError("Card not found");
      }

      if (!title || title.trim() === "") {
        throw new BadRequestError("Checklist title is required");
      }

      return await checklistModel.createChecklist(card_id, title);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to create checklist");
    }
  }

  async getAllChecklists(): Promise<Checklist[]> {
    try {
      return await checklistModel.getAll();
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to get checklists");
    }
  }

  async getChecklistById(checklist_id: number): Promise<Checklist> {
    try {
      const checklist = await checklistModel.getById(checklist_id);
      if (!checklist) throw new NotFoundError("Checklist not found");
      return checklist;
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to get checklist detail");
    }
  }

  async updateChecklistTitle(
    checklist_id: number,
    title: string,
  ): Promise<Checklist> {
    try {
      if (!title || title.trim() === "") {
        throw new BadRequestError("Title is required");
      }
      return await checklistModel.updateTitle(checklist_id, title);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to update checklist title");
    }
  }

  async deleteChecklist(checklist_id: number): Promise<void> {
    try {
      await checklistModel.deleteChecklist(checklist_id);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to delete checklist");
    }
  }

  async addItem(checklist_id: number, content: string) {
    try {
      if (!content || content.trim() === "") {
        throw new BadRequestError("Item content is required");
      }

      return await checklistModel.addItemToChecklist(checklist_id, content);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to add checklist item");
    }
  }

  async updateItem(item_id: number, content: string): Promise<void> {
    try {
      if (!content || content.trim() === "") {
        throw new BadRequestError("Item content is required");
      }

      await checklistModel.updateItem(item_id, content);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to update checklist item");
    }
  }

  async toggleItem(item_id: number, is_completed: boolean): Promise<void> {
    try {
      await checklistModel.toggleItem(item_id, is_completed);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to toggle checklist item");
    }
  }

  async deleteItem(item_id: number): Promise<void> {
    try {
      await checklistModel.deleteItem(item_id);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to delete checklist item");
    }
  }

  async getProgress(checklist_id: number): Promise<number> {
    try {
      return await checklistModel.getProgress(checklist_id);
    } catch (e) {
      if (e instanceof ErrorResponse) throw e;
      throw new InternalServerError("Failed to get checklist progress");
    }
  }
}

export default new ChecklistService();

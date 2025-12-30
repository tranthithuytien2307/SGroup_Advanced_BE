import { AppDataSource } from "../data-source";
import { Label } from "../entities/label.entity";
import { InternalServerError, NotFoundError } from "../handler/error.response";
import cardModel from "../model/card.model";
import labelModel from "../model/label.model";

class LabelService {
  async createLabel(
    board_id: number,
    name: string | null,
    color: string
  ): Promise<Label> {
    try {
      return await labelModel.createLabel(board_id, name, color);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerError("Failed to create label");
    }
  }

  async getLabelByBoardId(board_id: number): Promise<Label[]> {
    try {
      return await labelModel.getLabelByBoardId(board_id);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerError("Failed to get label by board id");
    }
  }

  async attachLabelsToCard(
    card_id: number,
    label_ids: number[]
  ): Promise<void> {
    try {
      const card = await cardModel.getById(card_id);
      if (!card) {
        throw new NotFoundError("Card not found");
      }

      return await AppDataSource.manager.transaction(async (manager) => {
        for (const label_id of label_ids) {
          const label = await labelModel.getLabelById(label_id);
          if (!label) {
            throw new NotFoundError(`Label ${label_id} not found`);
          }

          await labelModel.attachLabelToCard(manager, card_id, label_id);
        }
      });
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new InternalServerError("Failed to attach labels to card");
    }
  }

  async detachLabelsFromCard(
    card_id: number,
    label_ids: number[]
  ): Promise<void> {
    const card = await cardModel.getById(card_id);
    if (!card) throw new NotFoundError("Card not found");

    return AppDataSource.manager.transaction((manager) =>
      labelModel.detachLabelFromCard(manager, card_id, label_ids)
    );
  }
}

export default new LabelService();

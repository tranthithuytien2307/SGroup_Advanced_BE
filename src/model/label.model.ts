import { Label } from "../entities/label.entity";
import { AppDataSource } from "../data-source";
import { Card } from "../entities/card.entity";
import { EntityManager } from "typeorm";

class LabelModel {
  private labelRepository = AppDataSource.getRepository(Label);
  private cardRepository = AppDataSource.getRepository(Card);

  async createLabel(
    board_id: number,
    name: string | null,
    color: string
  ): Promise<Label> {
    const label = this.labelRepository.create({
      board_id,
      name,
      color,
    });
    return await this.labelRepository.save(label);
  }

  async getLabelByBoardId(board_id: number): Promise<Label[]> {
    return await this.labelRepository.find({
      where: { board_id },
    });
  }

  async attachLabelToCard(
    manager: EntityManager,
    card_id: number,
    label_id: number
  ): Promise<void> {
    const cardRepo = manager.getRepository(Card);
    const labelRepo = manager.getRepository(Label);

    const card = await cardRepo.findOne({
      where: { id: card_id },
      relations: ["labels"],
    });

    if (!card) {
      throw new Error("Card not found");
    }

    const label = await labelRepo.findOne({
      where: { id: label_id },
    });

    if (!label) {
      throw new Error("Label not found");
    }

    const exists = card.labels.some((label) => label.id === label_id);
    if (exists) return;

    card.labels.push(label);
    await cardRepo.save(card);
  }

  async getLabelById(id: number) {
    return await this.labelRepository.findOne({
      where: { id },
    });
  }

  async detachLabelFromCard(
    manager: EntityManager,
    card_id: number,
    label_ids: number[]
  ): Promise<void> {
    const cardRepo = manager.getRepository(Card);

    const card = await cardRepo.findOne({
      where: { id: card_id },
      relations: ["labels"],
    });
    if (!card) {
      throw new Error("Card not found");
    }
    card.labels = card.labels.filter((label) => !label_ids.includes(label.id));

    await cardRepo.save(card);
  }
}

export default new LabelModel();

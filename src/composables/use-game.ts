// src/composables/use-game.ts

export enum FruitsEnum {
  Apple = 'Яблоки',
  AppleAndOrange = 'Яблоки и Апельсины',
  Orange = 'Апельсины',
}

export enum FruitEnum {
  Apple = 'Яблоко',
  Orange = 'Апельсин',
}

export class Box {
  constructor(
    public label: FruitsEnum,
    public isOpen: boolean = false,
    public prediction: FruitsEnum | null = null,
    public content: FruitsEnum | null = null,
    public took: FruitEnum | null = null,
  ) {}

  copy(): Box {
    return new Box(this.label, this.isOpen, this.prediction, this.content, this.took)
  }

  toJSON() {
    return {
      label: this.label,
      isOpen: this.isOpen,
      prediction: this.prediction,
      content: this.content,
      took: this.took,
    }
  }

  static fromJSON(json: any): Box {
    return new Box(json.label, json.isOpen, json.prediction, json.content, json.took)
  }
}

export class YouLostError extends Error {
  constructor() {
    super('You lost')
  }
}

export class FruitGame {
  public indexOpenedBox: number | null = null
  public _boxes: Box[]

  constructor() {
    this._boxes = [
      new Box(FruitsEnum.Apple),
      new Box(FruitsEnum.AppleAndOrange),
      new Box(FruitsEnum.Orange),
    ]
  }

  toJSON() {
    return {
      indexOpenedBox: this.indexOpenedBox,
      boxes: this._boxes.map(box => box.toJSON()),
    }
  }

  static fromJSON(json: any): FruitGame {
    const game = new FruitGame()
    game.indexOpenedBox = json.indexOpenedBox
    game._boxes = json.boxes.map((boxJson: any) => Box.fromJSON(boxJson))
    return game
  }

  clone(): FruitGame {
    return FruitGame.fromJSON(this.toJSON())
  }

  restart() {
    this.indexOpenedBox = null
    this._boxes.forEach(box => {
      box.isOpen = false
      box.prediction = null
      box.content = null
      box.took = null
    })
  }

  get boxes(): Box[] {
    return this._boxes.map(box => box.copy())
  }

  private openFirstBox(indexBox: number): void {
    if (this.indexOpenedBox !== null) throw new Error('Первую коробку можно открыть только один раз')
    this.indexOpenedBox = indexBox
    const box = this._boxes[indexBox]

    if (box.label === FruitsEnum.AppleAndOrange) {
      box.took = Math.random() < 0.5 ? FruitEnum.Apple : FruitEnum.Orange
      box.content = box.took === FruitEnum.Apple ? FruitsEnum.Apple : FruitsEnum.Orange

      // Распределяем содержимое остальных коробок
      const [boxApple, boxAppleAndOrange, boxOrange] = this._boxes
      boxApple.content = FruitsEnum.AppleAndOrange
      boxAppleAndOrange.content = FruitsEnum.Orange
      boxOrange.content = FruitsEnum.Apple
      if (box.took === FruitEnum.Apple) {
        boxApple.content = FruitsEnum.Orange
        boxAppleAndOrange.content = FruitsEnum.Apple
        boxOrange.content = FruitsEnum.AppleAndOrange
      }
    } else if (box.label === FruitsEnum.Apple) {
      box.took = FruitEnum.Orange
    } else if (box.label === FruitsEnum.Orange) {
      box.took = FruitEnum.Apple
    }
    box.isOpen = true
  }

  public setPrediction(indexBox: number, prediction: FruitsEnum): void {
    if (this.indexOpenedBox === null) throw new Error('Сначала откройте первую коробку')
    if (indexBox === this.indexOpenedBox) throw new Error('Нельзя предсказать содержимое уже открытой коробки')
    const openedOnlyOne = this._boxes.filter(box => box.isOpen).length === 1
    if (!openedOnlyOne) throw new Error('Для установки предсказания должна быть открыта только одна коробка')
    this._boxes[indexBox].prediction = prediction
  }

  private openOtherBox(indexBox: number): boolean {
    if (this.indexOpenedBox === null) throw new Error('Сначала откройте первую коробку')
    const allPredicted = this._boxes.filter(box => !box.isOpen).every(box => box.prediction !== null)
    if (!allPredicted) throw new Error('Не все коробки предсказаны, укажите оставшиеся предсказания')
    const box = this._boxes[indexBox]
    if (box.isOpen) throw new Error('Эта коробка уже открыта')
    box.isOpen = true

    const allOpened = this._boxes.every(b => b.isOpen)
    if (allOpened) {
      this._boxes[this.indexOpenedBox].took = null
    }
    return allOpened
  }

  public open(indexBox: number): boolean {
    if (this.indexOpenedBox === null) {
      this.openFirstBox(indexBox)
      return false
    } else {
      return this.openOtherBox(indexBox)
    }
  }

  public checkWin(): boolean {
    return this._boxes.every(box => {
      if (box.isOpen && box.prediction) {
        return box.prediction === box.content
      }
      return true
    })
  }
}

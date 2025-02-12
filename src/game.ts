// src/game.ts

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
    public isOpen: boolean,
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
      new Box(FruitsEnum.Apple, false),
      new Box(FruitsEnum.AppleAndOrange, false),
      new Box(FruitsEnum.Orange, false),
    ]
  }

  toJSON() {
    return {
      indexOpenedBox: this.indexOpenedBox,
      boxes: this._boxes.map((box) => box.toJSON()),
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
    this._boxes.forEach((box) => {
      box.isOpen = false
      box.prediction = null
      box.content = null
      box.took = null
    })
  }

  get boxes(): Box[] {
    return this._boxes.map((box) => box.copy())
  }

  // Открытие первой коробки (единственный выбор без предсказаний)
  private openOne(indexBox: number): void {
    if (this.indexOpenedBox !== null) throw new Error('Function only for first opening')
    this.indexOpenedBox = indexBox
    const box = this._boxes[indexBox]

    if (box.label === FruitsEnum.AppleAndOrange) {
      // Симулируем достать один фрукт
      box.took = Math.random() < 0.5 ? FruitEnum.Apple : FruitEnum.Orange
      box.content = box.took === FruitEnum.Apple ? FruitsEnum.Apple : FruitsEnum.Orange
      // Распределяем содержимое остальных коробок (логика из примера React)
      const [boxApple, boxAppleAndOrange, boxOrange] = this._boxes
      // Значения по умолчанию:
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

  // Установка предсказаний для коробок, кроме открытой первой
  public setPrediction(indexBox: number, prediction: FruitsEnum): void {
    if (this.indexOpenedBox === null) throw new Error('Function only for subsequent openings')
    if (indexBox === this.indexOpenedBox) throw new Error('Cannot predict opened box')
    const openedOnlyOne = this._boxes.filter((box) => box.isOpen).length === 1
    if (!openedOnlyOne) {
      throw new Error('Only one box can be opened at a time')
    }
    const box = this._boxes[indexBox]
    box.prediction = prediction
  }

  // Открытие остальных коробок после указания предсказаний
  private openOther(indexBox: number): boolean {
    if (this.indexOpenedBox === null) throw new Error('Function only for subsequent openings')
    const isPredicted = this._boxes.filter((box) => !box.isOpen).every((box) => box.prediction !== null)
    if (!isPredicted) {
      throw new Error('Не все ящики предсказаны, выберите остальные предсказания')
    }
    const box = this._boxes[indexBox]
    if (box.isOpen) {
      throw new Error('Box is already opened')
    }
    box.isOpen = true

    const isEveryOpened = this._boxes.every((b) => b.isOpen)
    if (isEveryOpened) {
      // После открытия всех коробок убираем значение took у первой
      this._boxes[this.indexOpenedBox].took = null
    }
    return isEveryOpened
  }

  // Метод открытия коробок: если ни одна не открыта – openOne, иначе openOther
  public open(indexBox: number): boolean {
    if (this.indexOpenedBox === null) {
      this.openOne(indexBox)
      return false
    } else {
      return this.openOther(indexBox)
    }
  }

  // Проверка выигрыша: сравнение предсказаний с содержимым
  public checkWin(): boolean {
    return this._boxes.every((box) => {
      if (box.isOpen && box.prediction) {
        return box.prediction === box.content
      }
      return true
    })
  }
}

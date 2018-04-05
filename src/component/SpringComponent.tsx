import * as d3 from 'd3';
import * as PIXI from 'pixi.js';
import * as React from 'react';
import { ISpringGraphData, ISpringLink, ISpringNode } from 'spring';

export interface ISpringComponentProps {
  canvasBackgroundColor?: number;
  data: ISpringGraphData;
  selectedCategory?: string;
}

export class SpringComponent extends React.Component<ISpringComponentProps, any> {
  public static defaultProps: Partial<ISpringComponentProps> = {
    canvasBackgroundColor: 0xcccccc,
    data: {
      links: [],
      nodes: [],
    },
  };

  protected pixiApp: PIXI.Application = new PIXI.Application();

  protected canvasElement?: HTMLCanvasElement;
  protected canvasWidth = 600;
  protected canvasHeight = 600;

  protected nodeSprites: PIXI.Container = new PIXI.Container();
  protected edgeSprites: PIXI.Container = new PIXI.Container();

  constructor(props: any = SpringComponent.defaultProps) {
    super(props);
  }

  public componentDidMount() {
    this.pixiApp = new PIXI.Application(this.canvasWidth, this.canvasHeight, {
      backgroundColor: this.props.canvasBackgroundColor,
      view: this.canvasElement,
    });
  }

  public componentDidUpdate(prevProps: ISpringComponentProps, prevState: any) {
    const { data, selectedCategory } = this.props;
    const isNewData = data && data !== prevProps.data;
    if (isNewData) {
      const { pixiApp } = this;
      pixiApp.stage.removeChildren();

      this.nodeSprites.removeChildren();
      this.edgeSprites.removeChildren();
      this.generateNodeSprites(data.nodes, this.nodeSprites, selectedCategory);
      this.generateLinesSprite(data.links, this.edgeSprites, selectedCategory);

      this.centerCanvas(data);

      pixiApp.stage.addChild(this.edgeSprites);
      pixiApp.stage.addChild(this.nodeSprites);
    } else if (selectedCategory !== prevProps.selectedCategory) {
      this.updateNodeSprites(data.nodes, this.nodeSprites, selectedCategory);
      this.edgeSprites.removeChildren();
      this.generateLinesSprite(data.links, this.edgeSprites, selectedCategory);
      this.centerCanvas(data);
    }
  }

  public render() {
    const style = { width: this.canvasWidth, height: this.canvasHeight };
    return (
      <div id="SpringComponent" style={style}>
        <div id="PixiCanvasHolder">
          {<canvas ref={el => (this.canvasElement = el ? el : undefined)} style={style} />}
        </div>
      </div>
    );
  }

  protected generateLinesSprite(links: ISpringLink[], container: PIXI.Container, category?: string) {
    const lines = new PIXI.Graphics();
    for (const link of links) {
      const source = link.source as ISpringNode;
      const target = link.target as ISpringNode;

      if (category && source.category !== category && target.category !== category) {
        continue;
      }
      lines.lineStyle(5, 0xff0000, 1);
      lines.moveTo(source.x, source.y);
      lines.lineTo(target.x, target.y);
    }
    const linesBounds = lines.getBounds();
    const textureRect = new PIXI.Rectangle(
      linesBounds.x,
      linesBounds.y,
      Math.max(this.canvasWidth, linesBounds.width),
      Math.max(this.canvasHeight, linesBounds.height),
    );
    const linesTexture = this.pixiApp.renderer.generateTexture(
      lines,
      PIXI.SCALE_MODES.LINEAR,
      this.canvasWidth / this.canvasHeight,
      textureRect,
    );
    const linesSprite = new PIXI.Sprite(linesTexture);
    linesSprite.x = textureRect.x;
    linesSprite.y = textureRect.y;
    container.addChild(linesSprite);
  }

  protected generateNodeSprites(nodes: ISpringNode[], container: PIXI.Container, category?: string) {
    const SPRITE_IMG_SIZE = 32;
    const scaleFactor = 0.5 * 32 / SPRITE_IMG_SIZE;

    // TODO: Evaluate ParticleContainer is PIXI v5. The v4 version doesn't play nice with sprites rendered via PIXI.Graphics.
    // this.sprites = new PIXI.particles.ParticleContainer(data.nodes.length);

    for (const node of nodes) {
      const nodeTexture = new PIXI.Graphics();
      nodeTexture.beginFill(node.colorHex);
      nodeTexture.drawCircle(0, 0, SPRITE_IMG_SIZE / 2);
      nodeTexture.endFill();
      const sprite = new PIXI.Sprite(this.pixiApp.renderer.generateTexture(nodeTexture));
      sprite.x = node.x;
      sprite.y = node.y;
      if (category && node.category !== category) {
        sprite.alpha = 0.1;
      }
      sprite.anchor.set(0.5, 0.5);
      sprite.interactive = true;
      sprite.scale.set(scaleFactor);
      container.addChild(sprite);
    }
  }

  protected updateNodeSprites(nodes: ISpringNode[], container: PIXI.Container, category?: string) {
    for (let i = 0; i < container.children.length; ++i) {
      const node = nodes[i];
      const sprite = container.children[i];
      if (category && node.category !== category) {
        sprite.alpha = 0.1;
      } else {
        sprite.alpha = 1;
      }
    }
  }

  protected centerCanvas(data: ISpringGraphData) {
    const { edgeSprites, canvasHeight, nodeSprites, canvasWidth } = this;

    const allXs = data.nodes.map(node => node.x);
    const allYs = data.nodes.map(node => node.y);

    const max = {
      x: d3.max(allXs) as number,
      y: d3.max(allYs) as number,
    };
    const min = {
      x: d3.min(allXs) as number,
      y: d3.min(allYs) as number,
    };

    const dx = max.x - min.x + 50;
    const dy = max.y - min.y + 50;

    const scale = 0.85 / Math.max(dx / canvasWidth, dy / canvasHeight);

    const delta = {
      scale: scale - this.nodeSprites.scale.x,
      x: canvasWidth / 2 - (max.x + min.x) / 2 * scale - nodeSprites.position.x,
      y: canvasHeight / 2 + 30 - (max.y + min.y) / 2 * scale - nodeSprites.position.y,
    };

    nodeSprites.position.x += delta.x;
    nodeSprites.position.y += delta.y;
    nodeSprites.scale.x += delta.scale;
    nodeSprites.scale.y += delta.scale;
    edgeSprites.position = nodeSprites.position;
    edgeSprites.scale = nodeSprites.scale;
  }
}

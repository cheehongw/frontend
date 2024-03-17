import { KonvaEventObject } from 'konva/lib/Node';
import React, { RefObject } from 'react';
import {
  Circle,
  Group,
  Label as KonvaLabel,
  Tag as KonvaTag,
  Text as KonvaText
} from 'react-konva';

import CseMachine from '../../CseMachine';
import { Config, ShapeDefaultProps } from '../../CseMachineConfig';
import { Layout } from '../../CseMachineLayout';
import { GlobalFn, IHoverable } from '../../CseMachineTypes';
import {
  defaultSAColor,
  fadedSAColor,
  getBodyText,
  getParamsText,
  getTextWidth
} from '../../CseMachineUtils';
import { ArrowFromFn } from '../arrows/ArrowFromFn';
import { Binding } from '../Binding';
import { Value } from './Value';

/** this encapsulates a function from the global frame
 * (which has no extra props such as environment or fnName) */
export class GlobalFnValue extends Value implements IHoverable {
  centerX: number;
  readonly tooltipWidth: number;
  readonly exportTooltipWidth: number;
  readonly radius: number = Config.FnRadius;
  readonly innerRadius: number = Config.FnInnerRadius;
  private _arrow: ArrowFromFn | undefined;

  readonly paramsText: string;
  readonly bodyText: string;
  readonly exportBodyText: string;
  readonly tooltip: string;
  readonly exportTooltip: string;
  private selected: boolean = false;

  readonly labelRef: RefObject<any> = React.createRef();

  constructor(
    /** underlying function */
    readonly data: GlobalFn,
    /** what this value is being referenced by */
    mainReference: Binding
  ) {
    super();
    Layout.memoizeValue(data, this);

    // derive the coordinates from the main reference (binding)
    this._x = mainReference.frame.x() + mainReference.frame.width() + Config.FrameMarginX;
    this._y = mainReference.y();
    this.centerX = this._x + this.radius * 2;
    this._y += this.radius;

    this._width = this.radius * 4;
    this._height = this.radius * 2;

    this.paramsText = `params: ${getParamsText(this.data)}`;
    this.bodyText = `body: ${getBodyText(this.data)}`;
    this.exportBodyText =
      (this.bodyText.length > 23 ? this.bodyText.slice(0, 20) : this.bodyText)
        .split('\n')
        .slice(0, 2)
        .join('\n') + ' ...';
    this.tooltip = `${this.paramsText}\n${this.bodyText}`;
    this.exportTooltip = `${this.paramsText}\n${this.exportBodyText}`;
    this.tooltipWidth = Math.max(getTextWidth(this.paramsText), getTextWidth(this.bodyText));
    this.exportTooltipWidth = Math.max(
      getTextWidth(this.paramsText),
      getTextWidth(this.exportBodyText)
    );

    this.addReference(mainReference);
  }

  handleNewReference(): void {}

  arrow(): ArrowFromFn | undefined {
    return this._arrow;
  }

  onMouseEnter = (_: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.labelRef.current.show();
  };

  onMouseLeave = ({ currentTarget }: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    if (!this.selected) {
      this.labelRef.current.hide();
    } else {
      const container = currentTarget.getStage()?.container();
      container && (container.style.cursor = 'default');
    }
  };

  onClick = (_: KonvaEventObject<MouseEvent>) => {
    if (CseMachine.getPrintableMode()) return;
    this.selected = !this.selected;
    if (!this.selected) {
      this.labelRef.current.hide();
    } else {
      this.labelRef.current.show();
    }
  };

  draw(): React.ReactNode {
    this._isDrawn = true;
    if (Layout.globalEnvNode.frame) {
      this._arrow = new ArrowFromFn(this).to(Layout.globalEnvNode.frame) as ArrowFromFn;
    }
    const stroke = this.isReferenced() ? defaultSAColor() : fadedSAColor();
    return (
      <React.Fragment key={Layout.key++}>
        <Group
          onMouseEnter={e => this.onMouseEnter(e)}
          onMouseLeave={e => this.onMouseLeave(e)}
          ref={this.ref}
        >
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={stroke}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX - this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={stroke}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.radius}
            stroke={stroke}
          />
          <Circle
            {...ShapeDefaultProps}
            key={Layout.key++}
            x={this.centerX + this.radius}
            y={this.y()}
            radius={this.innerRadius}
            fill={stroke}
          />
        </Group>
        {CseMachine.getPrintableMode() ? (
          <KonvaLabel
            x={this.x() + this.width() + Config.TextPaddingX * 2}
            y={this.y() - Config.TextPaddingY}
            visible={true}
            ref={this.labelRef}
          >
            <KonvaTag stroke="black" fill={'white'} opacity={Config.FnTooltipOpacity} />
            <KonvaText
              text={this.exportTooltip}
              fontFamily={Config.FontFamily}
              fontSize={Config.FontSize}
              fontStyle={Config.FontStyle}
              fill={Config.SA_BLUE}
              padding={5}
            />
          </KonvaLabel>
        ) : (
          <KonvaLabel
            x={this.x() + this.width() + Config.TextPaddingX * 2}
            y={this.y() - Config.TextPaddingY}
            visible={false}
            ref={this.labelRef}
          >
            <KonvaTag stroke="black" fill={'black'} opacity={Config.FnTooltipOpacity} />
            <KonvaText
              text={this.tooltip}
              fontFamily={Config.FontFamily}
              fontSize={Config.FontSize}
              fontStyle={Config.FontStyle}
              fill={Config.SA_WHITE}
              padding={5}
            />
          </KonvaLabel>
        )}
        {Layout.globalEnvNode.frame && new ArrowFromFn(this).to(Layout.globalEnvNode.frame).draw()}
      </React.Fragment>
    );
  }
}

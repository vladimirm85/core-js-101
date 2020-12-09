/* ************************************************************************************************
 *                                                                                                *
 * Plese read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectagle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
const getJSON = (obj) => JSON.stringify(obj);


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
const fromJSON = (proto, json) => {
  const obj = JSON.parse(json);
  Object.setPrototypeOf(obj, proto);
  return obj;
};


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurences
 *
 * All types of selectors can be combined using the combinators ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string repsentation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

function Selector() {
  const selectors = [];

  let currentSelectorWeight = 0;

  const unchainableSelecors = [0, 1, 5];

  const isUnchainableInChain = (selector) => unchainableSelecors.findIndex(
    (selectorWeight) => selectorWeight === selector.weight,
  ) !== -1 && selectors.findIndex(
    ({ weight }) => weight === selector.weight,
  ) !== -1;

  const checkSequence = (selector) => {
    if (isUnchainableInChain(selector)) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    if (selector.weight < currentSelectorWeight) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }

    currentSelectorWeight = selector.weight;
  };

  const handleSelector = (selector) => {
    checkSequence(selector);
    selectors.push(selector);
  };

  const getSelectorString = ({ selectorName, symbols }) => {
    const preceedingSymbol = symbols[0] || '';
    const subsequentSymbol = symbols[1] || '';
    return `${preceedingSymbol}${selectorName}${subsequentSymbol}`;
  };

  const getSelectorObject = (selectorName, symbols, weight) => ({
    selectorName,
    symbols,
    weight,
  });

  this.element = (tagName) => {
    handleSelector(getSelectorObject(tagName, [], 0));
    return this;
  };

  this.id = (id) => {
    handleSelector(getSelectorObject(id, ['#'], 1));
    return this;
  };

  this.class = (className) => {
    handleSelector(getSelectorObject(className, ['.'], 2));
    return this;
  };

  this.attr = (attributeName) => {
    handleSelector(getSelectorObject(attributeName, ['[', ']'], 3));
    return this;
  };

  this.pseudoClass = (className) => {
    handleSelector(getSelectorObject(className, [':'], 4));
    return this;
  };

  this.pseudoElement = (className) => {
    handleSelector(getSelectorObject(className, ['::'], 5));
    return this;
  };

  this.stringify = () => selectors.reduce((acc, selector) => acc + getSelectorString(selector), '');
}

function Combiner(selector1, combinator, selector2) {
  this.LHselector = selector1;
  this.combinator = combinator;
  this.RHselector = selector2;

  this.stringify = () => `${this.LHselector.stringify()} ${this.combinator} ${this.RHselector.stringify()}`;
}

const cssSelectorBuilder = {
  element: (tagName) => new Selector().element(tagName),

  id: (id) => new Selector().id(id),

  class: (className) => new Selector().class(className),

  attr: (attributeName) => new Selector().attr(attributeName),

  pseudoClass: (className) => new Selector().pseudoClass(className),

  pseudoElement: (className) => new Selector().pseudoElement(className),

  combine: (selector1, combinator, selector2) => new Combiner(selector1, combinator, selector2),
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};

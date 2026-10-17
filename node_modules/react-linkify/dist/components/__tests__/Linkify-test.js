'use strict';

jest.autoMockOff();

var React = require('react');
var ReactTestUtils = require('react-dom/test-utils');
var renderer = require('react-test-renderer');

describe('Linkify', function () {
  var Linkify = require('../Linkify.jsx').default;

  describe('#parseString', function () {
    var linkify = ReactTestUtils.renderIntoDocument(React.createElement(
      Linkify,
      null,
      'test'
    ));

    it('should not modify the string', function () {
      var input = 'React is a JavaScript library for building user interfaces.';
      var output = linkify.parseString(input);

      expect(output).toEqual(input);
    });

    it('should parse http url', function () {
      var input = 'http://facebook.github.io/react/';
      var output = linkify.parseString(input);

      expect(output.type).toEqual('a');
      expect(output.props.href).toEqual(input);
      expect(output.props.children).toEqual(input);
    });

    it('should parse https url', function () {
      var input = 'https://facebook.github.io/react/';
      var output = linkify.parseString(input);

      expect(output.type).toEqual('a');
      expect(output.props.href).toEqual(input);
      expect(output.props.children).toEqual(input);
    });

    it('should parse no protocol url', function () {
      var input = 'facebook.github.io/react/';
      var output = linkify.parseString(input);

      expect(output.type).toEqual('a');
      expect(output.props.href).toEqual('http://' + input);
      expect(output.props.children).toEqual(input);
    });

    it('should parse url in beginning of text', function () {
      var input = ['https://github.com/facebook/react', ' is the location to the React source code.'];
      var output = linkify.parseString(input.join(''));

      expect(Array.isArray(output)).toEqual(true);
      expect(output[0].type).toEqual('a');
      expect(output[0].props.href).toEqual(input[0]);
      expect(output[0].props.children).toEqual(input[0]);
      expect(output[1]).toEqual(input[1]);
    });

    it('should parse url in middle of text', function () {
      var input = ['Go to ', 'https://github.com/facebook/react', ' for the React source code.'];
      var output = linkify.parseString(input.join(''));

      expect(Array.isArray(output)).toEqual(true);
      expect(output[0]).toEqual(input[0]);
      expect(output[1].type).toEqual('a');
      expect(output[1].props.href).toEqual(input[1]);
      expect(output[1].props.children).toEqual(input[1]);
      expect(output[2]).toEqual(input[2]);
    });

    it('should parse url in end of text', function () {
      var input = ['The React source code is located at ', 'https://github.com/facebook/react'];
      var output = linkify.parseString(input.join(''));

      expect(Array.isArray(output)).toEqual(true);
      expect(output[0]).toEqual(input[0]);
      expect(output[1].type).toEqual('a');
      expect(output[1].props.href).toEqual(input[1]);
      expect(output[1].props.children).toEqual(input[1]);
    });
  });

  describe('#parse', function () {
    var linkify = ReactTestUtils.renderIntoDocument(React.createElement(
      Linkify,
      null,
      'test'
    ));

    it('should not parse <a> elements', function () {
      var input = React.createElement(
        'a',
        { href: 'http://facebook.github.io/react/' },
        'http://facebook.github.io/react/'
      );
      var output = linkify.parse(input);

      expect(output).toEqual(input);
    });

    it('should not parse <button> elements', function () {
      var input = React.createElement(
        'button',
        null,
        'http://facebook.github.io/react/'
      );
      var output = linkify.parse(input);

      expect(output).toEqual(input);
    });

    it('should parse email', function () {
      var input = 'tasti@zakarie.com';
      var output = linkify.parseString(input);

      expect(output.type).toEqual('a');
      expect(output.props.href).toEqual('mailto:' + input);
      expect(output.props.children).toEqual(input);
    });

    it('should parse email in sentence', function () {
      var input = ['For more information, contact ', 'tasti@zakarie.com', '.'];
      var output = linkify.parseString(input.join(''));

      expect(Array.isArray(output)).toEqual(true);
      expect(output[0]).toEqual(input[0]);
      expect(output[1].type).toEqual('a');
      expect(output[1].props.href).toEqual('mailto:' + input[1]);
      expect(output[1].props.children).toEqual(input[1]);
      expect(output[2]).toEqual(input[2]);
    });

    it('should parse complex urls', function () {
      var input = ['For more information ', 'https://www.wayfair.de/dCor-design---DCOO1623-L6-K~DCOO1623.html?refid=MODE368-DCOO1623_21727408&PiID%5B%5D=21727408', '.'];

      var output = linkify.parseString(input.join(''));
      expect(output[1].props.children).toEqual(input[1]);
    });
  });

  describe('#render', function () {
    it('should render correctly (start)', function () {
      var tree = renderer.create(React.createElement(
        Linkify,
        null,
        'https://github.com/facebook/react is the location to the React source code.'
      )).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('should render correctly (middle)', function () {
      var tree = renderer.create(React.createElement(
        Linkify,
        null,
        'Go to https://github.com/facebook/react for the React source code.'
      )).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('should render correctly (end)', function () {
      var tree = renderer.create(React.createElement(
        Linkify,
        null,
        'The React source code is located at https://github.com/facebook/react'
      )).toJSON();

      expect(tree).toMatchSnapshot();
    });

    it('testing', function () {
      var tree = renderer.create(React.createElement(
        React.Fragment,
        null,
        'The React source code is located at ',
        React.createElement(
          'bold',
          null,
          'woah'
        )
      )).toJSON();

      expect(tree).toMatchSnapshot();
    });

    // it('should render with default className of Linkify if one is not provided', () => {
    //   const linkify = ReactTestUtils.renderIntoDocument(<Linkify></Linkify>);
    //   expect(linkify.props.className).toEqual('Linkify');
    // });

    // it('should render with a custom className if one is provided', () => {
    //   const linkify = ReactTestUtils.renderIntoDocument(<Linkify className="custom-class"></Linkify>);

    //   expect(linkify.props.className).toEqual('custom-class');
    // });
  });

  describe('#static', function () {
    //const Linkify = require('../Linkify.jsx');
  });
});
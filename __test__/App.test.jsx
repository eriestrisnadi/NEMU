import React from "react";
import App from "../src/app/App";
import renderer from "react-test-renderer";
import pkg from "../package.json";

const evt = {
  preventDefault: jest.fn(),
  dataTransfer: {
    dropEffect: "",
    files: [
      {
        name: "",
      },
    ],
  },
};

test("App should render first Home Component", () => {
  const component = renderer.create(<App title={pkg.name} />);
  let tree = component.toJSON();
  expect(tree.props.className).toEqual("App");
  expect(tree.children[0].type).toEqual("div");
  expect(tree.children[0].children[0].type).toEqual("h1");
  expect(tree.children[0].children[0].children[0]).toEqual(pkg.name);
  expect(tree).toMatchSnapshot();

  tree = tree.children[0];
  tree.props.onDragOver(evt);

  // re-rendering
  expect(component.toJSON()).toMatchSnapshot();
});

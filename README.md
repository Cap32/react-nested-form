# react-nested-form [WIP]

## Installations

```bash
yarn add react-nested-form
```

## WTF

```js
import React, { Component } from 'react';
import { Form, Input, ArrayOf, ObjectOf } from 'react-nested-form';

export default class MyFriend extends Component {
  myData = {
    name: 'Luke Skywalker',
    height: 172,
    starships: ['X-wing', 'Imperial shuttle'],
    colors: {
      hair: 'blond',
      skin: 'fair',
    },
  },

  handleSubmit = (data) => {
    console.log('data', data);
  };

  render() {
    return (
      <Form data={this.myData} onSubmit={this.handleSubmit}>
        <Input name="name" />
        <Input name="height" dataType="number" />
        <ArrayOf name="starships">
          {(starships) => starships.map((starship) =>
            <Input name={starship.name} key={starship.key} />
          )}
        </ArrayOf>
        <ObjectOf name="colors">
          <Input name="hair" />
          <Input name="skin" />
        </ObjectOf>
        }
      </Form>
    );
  }
}
```

## License

MIT

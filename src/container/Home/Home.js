import React, {Component} from 'react';
import {View, Text} from 'react-native';
import {acc} from '../../utils/account';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const account = acc.createAccountWithMneomnic();
    console.log('account', account);
  }

  render() {
    return (
      <View>
        <Text>sss</Text>
      </View>
    );
  }
}

export default Home;

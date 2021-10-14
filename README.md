# Resources
- [Web App GitHub Repo](https://github.com/magiclabs/example-celo-guide)
- [Web app Demo](https://magic-celo.vercel.app/login)
- [React Native App GitHub Repo](https://github.com/magiclabs/example-celo-guide-rn)
- [Celo Alfajores Testnet](https://alfajores-blockscout.celo-testnet.org)

# What is Celo

Celo is a mobile-first, EVM-compatible blockchain built for payment-focused decentralized applications. Having a mobile-first approach, apps built on Celo can reach a wider audience, with the nearly 4 billion smart phone users world-wide. And to fit the payment-focused narrative, Celo has a Celo Dollar (`cUSD`) native stablecoin so that transactions aren't exposed to price volatility. 

Other reasons developers may consider Celo is that transactions are confirmed fast, usually in just a few seconds, with very low transaction fees. Using Celo with Magic, your users can authenticate through a web2-like login experience on your mobile or web app, and not have to worry about managing or securing their private keys themselves. 

To connect to Celo with Magic, developers can simply pass in the Celo network URL when initiating a Magic instance. This guide will show how you can build a basic dapp on the Celo blockchain, allow users to call smart contracts and send transactions.

# Tutorial

This application will be broken out into two parts. Part 1 will be building a web app, and part 2 will be building a React Native mobile app. 

# Part 1 - Web App

## Quick Start

```
$ git clone https://github.com/magiclabs/example-celo-guide.git
$ cd example-celo-guide
$ mv .env.example .env // enter your API Key into .env (from https://dashboard.magic.link)
$ yarn install
$ yarn start
```

## Connecting to Celo

In `magic.js`, pass in the Celo network URL you want to connect to (Alfajores Testnet in this case) and initialize a new `Web3` instance using Magic as the `rpc provider`. 

```js
import { Magic } from 'magic-sdk';
import Web3 from 'web3';

export const magic = new Magic(process.env.REACT_APP_MAGIC_PUBLISHABLE_KEY, {
  network: {
    rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  }
});

export const web3 = new Web3(magic.rpcProvider);
```

## Login with Magic

When users log in with Magic (through clicking on a link sent to their email), they will automatically be generated a Celo public / private key pair. Once logged in, a user can deposit funds to their newly created address, and as the developer, you can build out the wallet UI and logic with web3 libraries such as web3.js or ethers.js. 

```js
const login = useCallback(async () => {
  await magic.auth.loginWithMagicLink({
    email,
    redirectURI: new URL('/callback', window.location.origin).href,
  });
  history.push('/');
}, [email]);

/**
 * Saves the value of our email input into component state.
 */
const handleInputOnChange = useCallback(event => {
  setEmail(event.target.value);
}, []);

return (
  <div className='container'>
    <h1>Please sign up or login</h1>
    <input
      type='email'
      name='email'
      required='required'
      placeholder='Enter your email'
      onChange={handleInputOnChange}
      disabled={isLoggingIn}
    />
    <button onClick={login} disabled={isLoggingIn}>Send</button>
  </div>
);
```

## Viewing User Balance

Similar to how you would get a user's balance for an Ethereum application, since Celo is EVM compatible, you can call `web3.eth.getBalance`. 

```js
const fetchBalance = (address) => {
  web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
}

return (
<h1>Balance</h1>
<div className="info">
  {balance.toString().substring(0, 7)} CELO
</div>
)
```

## Send Transaction

Sending a transaction is also very simple. All that's needed is to provide an amount to send, and `from` and `to` addresses. If no `gas` or `gasPrice` are explicitly passed in, the gas limit and price will be calculated automatically. Otherwise, the values passed in will be used.

```js
const sendTransaction = async () => {
  if (!toAddress || !amount) return;
  const { transactionHash } = await web3.eth.sendTransaction({
    from: user.publicAddress,
    to: toAddress,
    value: web3.utils.toWei(amount)
  });
}

return (
 <div className="container">
  <h1>Send Transaction</h1>
  <input 
    type="text" 
    value={toAddress} 
    onChange={(e) => setToAddress(e.target.value)} 
    placeholder="To Address" 
  />
  <input 
    type="text" 
    value={amount} 
    onChange={(e) => setAmount(e.target.value)} 
    placeholder="Amount" 
  />
  <button onClick={sendTransaction}>Send Transaction</button>
</div>
)
```

## Calling Smart Contracts

The deployed `HelloWorld` smart contract has an `update` fuction which we'll call to update the `message` variable, which we're displaying in the web app.

```js
const contractAddress = '0x1e1bF128A09fD30420CE9fc294C4266C032eF6E7';
const contract = new web3.eth.Contract(abi, contractAddress);

// Grabbing `message` variable value stored in the smart contract
const fetchContractMessage = () => contract.methods.message().call().then(setMessage)

// Update contract `message` value on the blockchain
const updateContractMessage = async () => {
  if (!newMessage) return;
  const receipt = await contract.methods.update(newMessage).send({ from: user.publicAddress });
}

return (
  <h1>Contract Message</h1>
  <div className="info">{message}</div>

  <h1>Update Message</h1>
  <input 
    type="text" 
    value={newMessage} 
    onChange={(e) => setNewMessage(e.target.value)} 
    placeholder="New Message" />

  <button onClick={updateContractMessage}>Update</button>
)
```

And that's all that's involved for building a web app on Celo! A user can view their `CELO` token balance, send a transaction, and interact with smart contracts deployed to the Celo network.

# Part 2 - Mobile App (React Native)

Since Celo is a mobile-first blockchain, this will also be covering how you can build a react native app on this blockchain, with the same functionality as the web app example above.

## Quick Start

```
$ git clone https://github.com/magiclabs/example-celo-guide-rn.git
$ cd example-celo-guide-rn
// enter your API key from https://dashboard.magic.link into the `Magic()` constructor in `magic.js`
$ yarn install
$ yarn start
```

## React Native App Setup

Run `$ expo init` (must have the expo-cli installed globally) and select the `blank` template to create our expo app. 

Use this command to install the dependencies you'll need: `$ yarn add @magic-sdk/react-native node-libs-browser react-native-webview web3`.

Note: if you run into an error such as `"Crypto" could not be found within the project`, craete a file called `metro.config.js` at the root of your project and add to it the following contents:

```js
module.exports = {
  resolver: {
    extraNodeModules: require('node-libs-browser'),
  },
};
```

After these setup steps, you're good to start building!

## Connecting to Celo

In `magic.js`, pass in the Celo network URL you want to connect to (Alfajores Testnet in this case) and initialize a new `Web3` instance using Magic as the `rpc provider`. 

```js
import { Magic } from '@magic-sdk/react-native';
import Web3 from 'web3';

export const magic = new Magic('YOUR_MAGIC_API_KEY', {
  network: {
    rpcUrl: 'https://alfajores-forno.celo-testnet.org'
  }
});

export const web3 = new Web3(magic.rpcProvider);
```

## Logging in with Magic

When users log in with Magic (through clicking on a link sent to their email), they will automatically be generated an ethereum-compatible public / private key pair. Once logged in, a user can deposit funds to their newly created address, and as the developer, you can build out the wallet UI and logic with web3 libraries such as web3.js or ethers.js.

```js
export default function App() {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');

  // Trigger magic link for user to login / generate wallet
  const login = async () => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      magic.user.getMetadata().then(setUser);
    } catch(err) {
      alert(err);
    }
  };

  return (
    <View style={styles.container}>
      {
      !user ? 
        <View>
          <Text style={styles.header}>Login or Signup</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setEmail(text)}
            value={email}
            placeholder='Enter your email'
          />
          <View>
            <Pressable style={styles.button} onPress={() => login()}><Text style={styles.buttonText}>Login</Text></Pressable>
          </View>
        </View> : 
        <ScrollView>
          // Show Logged In User View
        </ScrollView>
      }
      {/* Below line is required to render the `Relayer` component into our app for Magic to properly work */}
      <magic.Relayer />
    </View>
  );
}
```

## View User Balance

Similar to how you would get a user's balance for an Ethereum application, since Celo is EVM compatible, you can call `web3.eth.getBalance`. 

```js
const [balance, setBalance] = useState('...');

// Fetch logged in user's Celo balance
const fetchBalance = (address) => {
  web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
}

return (
  <View style={styles.view}>
    <Text style={styles.header}>Balance</Text>
    <Text style={styles.info}>{balance} CELO</Text>
  </View>
)
```

## Send Transaction

Sending a transaction is also very simple. All that's needed is to provide an amount to send, and `from` and `to` addresses. If no `gas` or `gasPrice` are explicitly passed in, the gas limit and price will be calculated automatically. Otherwise, the values passed in will be used.

```js
const [toAddress, setToAddress] = useState('');
const [amount, setAmount] = useState('');
const [sendTxnBtnText, setSendTxnBtnText] = useState('Send');
const [sendTxnHash, setSendTxnHash] = useState('');

// Submit a transaction to Celo network
const sendTransaction = async () => {
  if (!amount || !toAddress) return;
  const { transactionHash } = await web3.eth.sendTransaction({
    from: user.publicAddress,
    to: toAddress,
    value: web3.utils.toWei(amount)
  });
  setSendTxnHash(transactionHash);
}

return (
  <View style={styles.view}>
    <Text style={styles.header}>Send Transaction</Text>
    <TextInput style={styles.input} value={toAddress} onChangeText={text => setToAddress(text)} placeholder="To..."></TextInput>
    <TextInput style={styles.input} value={amount} onChangeText={text => setAmount(text)} placeholder="Amount..."></TextInput>
    <Pressable style={styles.button} onPress={() => sendTransaction()}><Text style={styles.buttonText}>{sendTxnBtnText}</Text></Pressable>
    <Text style={styles.text}>{sendTxnHash && <Text onPress={() => Linking.openURL(`https://alfajores-blockscout.celo-testnet.org/tx/${sendTxnHash}`)}>View Transaction ↗️</Text>}</Text>
  </View>
);

```

## Calling Smart Contracts

The deployed `HelloWorld` smart contract has an `update` fuction which we'll call to update the `message` variable, which we're displaying in the web app.

```js
const contractAddress = '0x1e1bF128A09fD30420CE9fc294C4266C032eF6E7';
const contract = new web3.eth.Contract(abi, contractAddress);
const [message, setMessage] = useState('...');
const [newMessage, setNewMessage] = useState('');
const [updateContractBtnText, setUpdateContractBtnText] = useState('Update');
const [updateContractTxnHash, setUpdateContractTxnHash] = useState('');

const fetchContractMessage = () => contract.methods.message().call().then(setMessage);

const updateContractMessage = async () => {
  if (!newMessage) return;
  let { transactionHash } = await contract.methods.update(newMessage).send({ from: user.publicAddress });
  setUpdateContractTxnHash(transactionHash);
}

return (
  <View style={styles.view}>
    <Text style={styles.header}>Contract Message</Text>
    <Text style={styles.info}>{message}</Text>
    <Text style={styles.header}>Update Message</Text>
    <TextInput style={styles.input} value={newMessage} onChangeText={text => setNewMessage(text)} placeholder="New Message"></TextInput>
    <Pressable style={styles.button} onPress={() => updateContractMessage()}><Text style={styles.buttonText}>{updateContractBtnText}</Text></Pressable>
    <Text style={styles.text}>{updateContractTxnHash && <Text onPress={() => Linking.openURL(`https://alfajores-blockscout.celo-testnet.org/tx/${updateContractTxnHash}`)}>View Transaction ↗️</Text>}</Text>
  </View>
);
```

## Done

You now have a web and mobile app built on Celo, which lets users login/create a wallet with just a magic link and interact with the Celo blockchain. 

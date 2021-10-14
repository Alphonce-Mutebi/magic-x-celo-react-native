import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, Text, View, TextInput, Pressable, Linking } from 'react-native';
import { magic, web3 } from './magic';
import { abi } from './contract/abi.js';

export default function App() {
  // User
  const [email, setEmail] = useState('');
  const [user, setUser] = useState('');
  const [balance, setBalance] = useState('...');

  // Send Transaction
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [sendTxnBtnDisabled, setSendTxnBtnDisabled] = useState(false);
  const [sendTxnBtnText, setSendTxnBtnText] = useState('Send');
  const [sendTxnHash, setSendTxnHash] = useState('');

  // Update Smart Contract Message
  const contractAddress = '0x1e1bF128A09fD30420CE9fc294C4266C032eF6E7';
  const contract = new web3.eth.Contract(abi, contractAddress);
  const [message, setMessage] = useState('...');
  const [newMessage, setNewMessage] = useState('');
  const [updateContractBtnDisabled, setUpdateContractBtnDisabled] = useState(false);
  const [updateContractBtnText, setUpdateContractBtnText] = useState('Update');
  const [updateContractTxnHash, setUpdateContractTxnHash] = useState('');

  // If user is logged in, fetch user wallet balance and the `message` variable value from the smart contract
  useEffect(() => {
    magic.user.isLoggedIn().then(isLoggedIn => {
      if (!isLoggedIn) return setUser('');
      magic.user.getMetadata().then(user => {
        setUser(user);
        fetchBalance(user.publicAddress);
        fetchContractMessage();
      });
    })
  }, [])

  // Trigger magic link for user to login / generate wallet
  const login = async () => {
    try {
      await magic.auth.loginWithMagicLink({ email });
      magic.user.getMetadata().then(setUser);
    } catch(err) {
      alert(err);
    }
  };

  // Logout of Magic session
  const logout = async () => {
    await magic.user.logout();
    setUser('');
  };

  // Fetch logged in user's Celo balance
  const fetchBalance = (address) => {
    web3.eth.getBalance(address).then(bal => setBalance(web3.utils.fromWei(bal)))
  }

  // Submit a transaction to Celo network
  const sendTransaction = async () => {
    if (!amount || !toAddress) return;
    disableSendTxnForm();
    const { transactionHash } = await web3.eth.sendTransaction({
      from: user.publicAddress,
      to: toAddress,
      value: web3.utils.toWei(amount)
    });
    setSendTxnHash(transactionHash);
    enableSendTxnForm();
  }

  // Disable input form while the transaction is being confirmed
  const disableSendTxnForm = () => {
    setSendTxnHash('');
    setSendTxnBtnDisabled(true);
    setSendTxnBtnText('Pending...');
  }

  // Re-enable input form once the transaction is confirmed
  const enableSendTxnForm = () => {
    setSendTxnBtnDisabled(false);
    setToAddress(''); // Clear form inputs
    setAmount(''); // Clear form inputs
    fetchBalance(user.publicAddress); // Update balance after gas fee paid for transaction
    setSendTxnBtnText('Send');
  }

  const fetchContractMessage = () => contract.methods.message().call().then(setMessage);

  const updateContractMessage = async () => {
    if (!newMessage) return;
    disableUpdateContractForm();
    let { transactionHash } = await contract.methods.update(newMessage).send({ from: user.publicAddress });
    setUpdateContractTxnHash(transactionHash);
    enableUpdateContractForm();
  }

  const disableUpdateContractForm = () => {
    setUpdateContractBtnDisabled(true);
    setUpdateContractTxnHash(''); // Clear link to previous transaction hash
    setUpdateContractBtnText('Pending...');
  }

  const enableUpdateContractForm = () => {
    setUpdateContractBtnDisabled(false);
    setNewMessage(''); // Clear form input
    fetchBalance(user.publicAddress); // Update balance after gas fee paid for transaction
    fetchContractMessage(); // Show new value of the smart contract variable `message`
    setUpdateContractBtnText('Update');
  }


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
          <View>
            {/* USER */}
            <View style={styles.view}>
              <Text style={styles.text}>{user.email}</Text>
              <Pressable style={styles.button} onPress={() => logout()}><Text style={styles.buttonText}>Logout</Text></Pressable>
            </View>

            {/* INFO */}
            <View style={styles.view}>
              <Text style={styles.header}>Network</Text>
              <Text style={styles.info}>CELO Ajfajores</Text>

              <Text style={styles.header}>Public Address</Text>
              <Text style={styles.info}>{user.publicAddress}</Text>

              <Text style={styles.header}>Balance</Text>
              <Text style={styles.info}>{balance} CELO</Text>

              <Text style={styles.text} onPress={() => Linking.openURL('https://celo.org/developers/faucet')}>Get Test Celo ↗️</Text>
            </View>

            {/* SEND TRANSACTION */}
            <View style={styles.view}>
              <Text style={styles.header}>Send Transaction</Text>
              <TextInput style={styles.input} value={toAddress} onChangeText={text => setToAddress(text)} placeholder="To..."></TextInput>
              <TextInput style={styles.input} value={amount} onChangeText={text => setAmount(text)} placeholder="Amount..."></TextInput>
              <Pressable style={styles.button} onPress={() => sendTransaction()} disabled={sendTxnBtnDisabled}><Text style={styles.buttonText}>{sendTxnBtnText}</Text></Pressable>
              <Text style={styles.text}>{sendTxnHash && <Text onPress={() => Linking.openURL(`https://alfajores-blockscout.celo-testnet.org/tx/${sendTxnHash}`)}>View Transaction ↗️</Text>}</Text>
            </View>

            {/* SMART CONTRACT */}
            <View style={styles.view}>
              <Text style={styles.header}>Contract Message</Text>
              <Text style={styles.info}>{message}</Text>
              <Text style={styles.header}>Update Message</Text>
              <TextInput style={styles.input} value={newMessage} onChangeText={text => setNewMessage(text)} placeholder="New Message"></TextInput>
              <Pressable style={styles.button} onPress={() => updateContractMessage()} disabled={updateContractBtnDisabled}><Text style={styles.buttonText}>{updateContractBtnText}</Text></Pressable>
              <Text style={styles.text}>{updateContractTxnHash && <Text onPress={() => Linking.openURL(`https://alfajores-blockscout.celo-testnet.org/tx/${updateContractTxnHash}`)}>View Transaction ↗️</Text>}</Text>
            </View>
          </View> 
        </ScrollView>
      }
      <StatusBar style="auto" />
      <magic.Relayer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    marginBottom: 60
  },
  view: {
    backgroundColor: "#eee",
    padding: 20,
    marginTop: 15,
    borderRadius: 8,
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  info: {
    fontFamily: 'Courier',
    backgroundColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    textAlign: "center"
  },
  input: {
    height: 38,
    margin: 5,
    borderWidth: 1,
    padding: 6,
    backgroundColor: '#fff',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 4,
    backgroundColor: 'black',
    marginTop: 12,
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: 'bold',
    letterSpacing: 0.25,
    color: 'white',
  },
  text: {
    textAlign: "center",
    marginTop: 10
  }
});

# 🧪 Przewodnik Testowania Debate App - Blockchain Integration

## 📋 Adresy Kontraktów (Ethereum Sepolia)

### ✅ Wdrożone Kontrakty:
- **DebateToken**: `0x6B89494D4a96f4D16D294c4afa3583A076f51397`
- **MockUSDC**: `0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0`
- **DebateContractV2**: `0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001`

### 🔗 Etherscan Links:
- [DebateToken](https://sepolia.etherscan.io/address/0x6B89494D4a96f4D16D294c4afa3583A076f51397)
- [MockUSDC](https://sepolia.etherscan.io/address/0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0)
- [DebateContractV2](https://sepolia.etherscan.io/address/0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001)

## 🚀 Kroki Testowania

### 1. **Przygotowanie Środowiska**
```bash
# Skopiuj zmienne środowiskowe
cp env.example .env.local

# Zaktualizuj .env.local z adresami kontraktów:
NEXT_PUBLIC_DEBATE_TOKEN_ADDRESS=0x6B89494D4a96f4D16D294c4afa3583A076f51397
NEXT_PUBLIC_MOCK_USDC_ADDRESS=0x5Cbd5C4e3ab02254dF6B104A7C842e7C3e60eEF0
NEXT_PUBLIC_DEBATE_CONTRACT_V2_ADDRESS=0x4e43B6B6e6605B43b3287FDfdA0cA32dFf5eE001
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=Ethereum Sepolia
```

### 2. **Uruchomienie Aplikacji**
```bash
npm run dev
```

### 3. **Testowanie Krok po Kroku**

#### **Krok 1: Połączenie Portfela**
1. Otwórz aplikację w przeglądarce
2. Kliknij "Connect Wallet" 
3. Wybierz portfel (MetaMask, WalletConnect, etc.)
4. **WAŻNE**: Przełącz na **Ethereum Sepolia** testnet
5. Sprawdź czy widzisz:
   - Adres portfela
   - Network: "Ethereum Sepolia"
   - ETH Balance
   - DEBATE Token Balance (początkowo 0)
   - MockUSDC Balance (początkowo 0)

#### **Krok 2: Uzyskanie Tokenów Testowych**
1. Kliknij "Show Contract Tester"
2. W sekcji "Token Actions":
   - Kliknij **"Get MockUSDC (Faucet)"** - otrzymasz 1000 MockUSDC
   - Kliknij **"Mint 1000 DEBATE Tokens"** - otrzymasz 1000 DEBATE
3. Sprawdź czy balances się zaktualizowały

#### **Krok 3: Testowanie Staking DEBATE Tokenów**
1. W sekcji "Stake and Vote":
   - Wpisz kwotę do stake (np. 100 DEBATE)
   - Wybierz opcję (Option 1 lub Option 2)
   - Kliknij **"Stake and Vote"**
2. Potwierdź transakcję w portfelu
3. Sprawdź czy stake został zarejestrowany

#### **Krok 4: Tworzenie Debatu**
1. W sekcji "Create Debate":
   - Wpisz tytuł: "Test Debate"
   - Wpisz opis: "This is a test debate for blockchain integration"
   - Opcje: "Yes" i "No"
   - Kliknij **"Create Debate"**
2. Potwierdź transakcję (koszt: 50 DEBATE)
3. Sprawdź czy debate został utworzony

#### **Krok 5: Głosowanie w Debacie**
1. Po utworzeniu debatu, użyj funkcji "Stake and Vote"
2. Wybierz ID debatu (1)
3. Wybierz opcję (0 = "Yes", 1 = "No")
4. Wpisz kwotę stake (np. 50 DEBATE)
5. Kliknij **"Stake and Vote"**
6. Potwierdź transakcję

#### **Krok 6: Sprawdzenie Wyników**
1. Poczekaj aż debate się zakończy (1 godzina)
2. Sprawdź wyniki na Etherscan
3. Sprawdź czy możesz claim rewards

## 🔍 Sprawdzanie na Etherscan

### **DebateToken Contract:**
- Sprawdź `balanceOf` dla swojego adresu
- Sprawdź `totalSupply`
- Sprawdź `name()` i `symbol()`

### **MockUSDC Contract:**
- Sprawdź `balanceOf` dla swojego adresu
- Sprawdź `faucet()` function
- Sprawdź `totalSupply`

### **DebateContractV2:**
- Sprawdź `getTotalDebates()`
- Sprawdź `getDebate(1)` - pierwszy debate
- Sprawdź `hasUserVoted(1, YOUR_ADDRESS)`
- Sprawdź `getUserVote(1, YOUR_ADDRESS)`

## 🐛 Rozwiązywanie Problemów

### **Problem: "Insufficient funds"**
- **Rozwiązanie**: Upewnij się że masz ETH na Ethereum Sepolia
- **Faucet**: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet

### **Problem: "Wrong network"**
- **Rozwiązanie**: Przełącz portfel na Ethereum Sepolia (Chain ID: 11155111)

### **Problem: "Contract not found"**
- **Rozwiązanie**: Sprawdź czy adresy kontraktów są poprawne w .env.local

### **Problem: "Transaction failed"**
- **Rozwiązanie**: 
  - Zwiększ gas limit
  - Sprawdź czy masz wystarczająco ETH
  - Sprawdź czy kontrakt nie jest paused

## 📊 Oczekiwane Wyniki

### **Po połączeniu portfela:**
- ✅ Adres portfela wyświetlony
- ✅ Network: Ethereum Sepolia
- ✅ ETH balance > 0

### **Po faucet:**
- ✅ MockUSDC balance: 1000 USDC
- ✅ DEBATE balance: 1000 DEBATE

### **Po utworzeniu debatu:**
- ✅ DEBATE balance zmniejszony o 50 (creation fee)
- ✅ Total debates: 1
- ✅ Debate ID: 1

### **Po głosowaniu:**
- ✅ DEBATE balance zmniejszony o stake amount
- ✅ hasUserVoted(1, YOUR_ADDRESS): true
- ✅ getUserVote(1, YOUR_ADDRESS): stake amount + option

## 🎯 Następne Kroki

1. **Testowanie Staking**: Przetestuj staking DEBATE tokenów
2. **Testowanie Rewards**: Sprawdź system nagród
3. **Testowanie Governance**: Przetestuj funkcje governance
4. **Frontend Integration**: Zintegruj z główną aplikacją
5. **Production Deploy**: Wdróż na Base mainnet

## 📞 Wsparcie

Jeśli napotkasz problemy:
1. Sprawdź console w przeglądarce (F12)
2. Sprawdź transakcje na Etherscan
3. Sprawdź czy wszystkie zmienne środowiskowe są ustawione
4. Upewnij się że używasz Ethereum Sepolia testnet

---

**Powodzenia w testowaniu! 🚀**

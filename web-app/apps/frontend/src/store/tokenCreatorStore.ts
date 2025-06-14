import { create } from 'zustand';
import {
  TokenConfig,
  PartialTokenConfig,
  ERC20Config,
  ERC721Config,
  ERC1155Config,
  defaultERC20Config,
  defaultERC721Config,
  defaultERC1155Config,
} from '../types/token';

interface TokenCreatorState {
  tokenConfig: PartialTokenConfig;
  selectedStandard: TokenConfig['standard'] | null;
  generatedCode: string | null;
  isGenerating: boolean;

  setStandard: (standard: TokenConfig['standard'] | null) => void;
  updateConfig: <K extends keyof TokenConfig>(field: K, value: TokenConfig[K]) => void;
  updateFeature: <S extends TokenConfig['standard'], F extends keyof NonNullable<Extract<TokenConfig, { standard: S }>['features']>>(
    standard: S,
    feature: F,
    value: boolean
  ) => void;
  generateCode: () => Promise<void>;
  setGeneratedCode: (code: string) => void;
  resetConfig: () => void;
}

const initialConfig: PartialTokenConfig = {
  name: '',
  symbol: '',
};

export const useTokenCreatorStore = create<TokenCreatorState>((set, get) => ({
  tokenConfig: initialConfig,
  selectedStandard: null,
  generatedCode: null,
  isGenerating: false,

  setStandard: (standard) => {
    let defaultConfigState: PartialTokenConfig = {
      name: get().tokenConfig.name || '',
      symbol: get().tokenConfig.symbol || '',
      standard
    };
    if (standard === 'ERC20') {
      defaultConfigState = { ...defaultConfigState, ...defaultERC20Config };
    } else if (standard === 'ERC721') {
      defaultConfigState = { ...defaultConfigState, ...defaultERC721Config };
    } else if (standard === 'ERC1155') {
      defaultConfigState = { ...defaultConfigState, ...defaultERC1155Config };
    } else {
      defaultConfigState.standard = undefined; // Clear standard if null
    }
    set({ selectedStandard: standard, tokenConfig: defaultConfigState, generatedCode: null });
  },

  updateConfig: (field, value) => {
    set((state) => ({
      tokenConfig: {
        ...state.tokenConfig,
        [field]: value,
      },
    }));
  },

  updateFeature: (standard, feature, value) => {
    set((state) => {
      if (state.tokenConfig.standard !== standard) return state;

      const currentFeatures = (state.tokenConfig as any).features || {};
      return {
        tokenConfig: {
          ...state.tokenConfig,
          features: {
            ...currentFeatures,
            [feature]: value,
          },
        },
      };
    });
  },

  generateCode: async () => {
    set({ isGenerating: true, generatedCode: "// Generating code, please wait..." });
    const config = get().tokenConfig;

    await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause for UX

    if (!config.standard || !config.name?.trim() || !config.symbol?.trim()) {
      set({
        generatedCode: "// Error: Token Standard, Name, and Symbol are required to generate code.",
        isGenerating: false
      });
      return;
    }

    const contractSolName = config.name.replace(/\s+/g, '');
    let imports = new Set<string>();
    let inheritance = new Set<string>();
    let constructorArgs = "";
    let constructorBody = "";
    let contractBody = "";

    imports.add(`pragma solidity ^0.8.20;`);

    switch (config.standard) {
      case 'ERC20':
        const erc20 = config as ERC20Config;
        inheritance.add("ERC20");
        imports.add(`import "@openzeppelin/contracts/token/ERC20/ERC20.sol";`);
        constructorArgs = `string memory _name, string memory _symbol`;
        // ERC20 constructor call must happen first if it's the base
        let erc20ConstructorCall = `ERC20(_name, _symbol)`;


        if (erc20.features?.pausable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";`);
          inheritance.add("ERC20Pausable");
          // Pausable constructor is empty, no change to erc20ConstructorCall
          contractBody += `
    function pause() public virtual onlyOwner {
        _pause();
    }

    function unpause() public virtual onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256 value) internal virtual override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }\n`;
        }
        if (erc20.features?.burnable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";`);
          inheritance.add("ERC20Burnable");
        }
        if (erc20.features?.snapshots) {
          imports.add(`import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";`);
          inheritance.add("ERC20Snapshot");
          contractBody +=`
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Snapshot) {
        super._beforeTokenTransfer(from, to, amount);
    }\n`;
        }

        let permitConstructorCall = "";
        if (erc20.features?.permits) {
            imports.add(`import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";`);
            inheritance.add("ERC20Permit");
            permitConstructorCall = `ERC20Permit(_name)`;
        }

        // Votes implies Permit and potentially Snapshot. OpenZeppelin's ERC20Votes handles this.
        if (erc20.features?.votes) {
            imports.add(`import "@openzeppelin/contracts/governance/extensions/ERC20Votes.sol";`);
            // ERC20Votes inherits ERC20Permit. If both are selected, ERC20Votes takes precedence.
            inheritance.delete("ERC20Permit");
            inheritance.add("ERC20Votes");
            // ERC20Votes constructor requires no arguments
            // It calls ERC20Permit constructor internally
        }

        if (erc20.features?.flashMinting) {
            imports.add(`import "@openzeppelin/contracts/token/ERC20/extensions/ERC20FlashMint.sol";`);
            inheritance.add("ERC20FlashMint");
        }

        const receiver = erc20.premintReceiver?.trim() || "msg.sender";
        if (erc20.initialSupply && BigInt(erc20.initialSupply) > 0) {
            const R_val = erc20.premintReceiver?.trim();
            if(R_val && R_val !== "msg.sender"){
                 constructorArgs += `, address _premintReceiver`;
            }
            const supplyWei = BigInt(erc20.initialSupply) * BigInt(10 ** (erc20.decimals || 18));
            constructorBody += `        _mint(${R_val ? "_premintReceiver" : "msg.sender"}, ${supplyWei.toString()});\n`;
        }

        if (erc20.features?.mintable) {
          imports.add(`import "@openzeppelin/contracts/access/Ownable.sol";`);
          inheritance.add("Ownable");
          // Ownable constructor takes initialOwner
          constructorArgs = `address initialOwner` + (constructorArgs ? `, ${constructorArgs}`: "");
          // Add initialOwner to constructor call
          erc20ConstructorCall = `ERC20(_name, _symbol) Ownable(initialOwner)`;
          if(permitConstructorCall && !erc20.features.votes){ // ERC20Votes handles its own permit
            permitConstructorCall = `ERC20Permit(_name)`; // No change needed here as it's separate
          }

          contractBody += `
    function mint(address to, uint256 amount) public virtual onlyOwner {
        _mint(to, amount);
    }\n`;
        } else {
            // If not mintable and no Ownable needed for pausable, ensure constructor doesn't expect initialOwner
             if (!erc20.features?.pausable) { // Pausable also adds Ownable
                // No initialOwner needed
             } else { // Pausable needs Ownable
                imports.add(`import "@openzeppelin/contracts/access/Ownable.sol";`);
                inheritance.add("Ownable");
                constructorArgs = `address initialOwner` + (constructorArgs ? `, ${constructorArgs}`: "");
                erc20ConstructorCall = `ERC20(_name, _symbol) Ownable(initialOwner)`;
             }
        }
         // Ensure Ownable is added if pausable is true, even if not mintable
        if (erc20.features?.pausable && !erc20.features?.mintable) {
            imports.add(`import "@openzeppelin/contracts/access/Ownable.sol";`);
            inheritance.add("Ownable");
            if (!constructorArgs.includes("address initialOwner")) { // Avoid duplicate
                constructorArgs = `address initialOwner` + (constructorArgs ? `, ${constructorArgs}`: "");
            }
             erc20ConstructorCall = `ERC20(_name, _symbol) Ownable(initialOwner)`;
        }

        // Assemble constructor calls, ERC20 must be first if not Ownable
        let finalConstructorCalls = erc20ConstructorCall;
        if (permitConstructorCall && !erc20.features.votes) { // ERC20Votes handles its own permit
            finalConstructorCalls += ` ${permitConstructorCall}`;
        }
        // ERC20Votes constructor is implicit if inherited.
        // Ownable constructor is called with initialOwner if it's part of inheritance.


        code = `${Array.from(imports).join("\n")}\n\ncontract ${contractSolName} is ${Array.from(inheritance).join(", ")} {\n`;
        code += `    constructor(${constructorArgs}) ${finalConstructorCalls} {\n`;
        code += constructorBody;
        code += `    }\n`;
        code += contractBody;
        code += `}\n`;
        break;

      case 'ERC721':
        const erc721 = config as ERC721Config;
        inheritance.add("ERC721");
        imports.add(`import "@openzeppelin/contracts/token/ERC721/ERC721.sol";`);
        imports.add(`import "@openzeppelin/contracts/access/Ownable.sol";`); // Always Ownable for minting control
        inheritance.add("Ownable");

        constructorArgs = `address initialOwner, string memory _name, string memory _symbol`;
        let erc721ConstructorCall = `ERC721(_name, _symbol) Ownable(initialOwner)`;

        if (erc721.features?.burnable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";`);
          inheritance.add("ERC721Burnable");
        }
        if (erc721.features?.pausable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";`);
          inheritance.add("ERC721Pausable");
          contractBody += `
    function pause() public virtual onlyOwner {
        _pause();
    }

    function unpause() public virtual onlyOwner {
        _unpause();
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }\n`;
        }
        if (erc721.features?.enumerable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";`);
          inheritance.add("ERC721Enumerable");
           contractBody +=`
    function _increaseBalance(address account, uint128 amount) internal virtual override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, amount);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721, ERC721Enumerable ${erc721.features.pausable ? ", ERC721Pausable" : ""}) returns (address) {
        return super._update(to, tokenId, auth);
    }\n`;
        }
        if (erc721.features?.uriStorage) {
          imports.add(`import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";`);
          inheritance.add("ERC721URIStorage");
          contractBody +=`
    function _update(address to, uint256 tokenId, address auth) internal virtual override(ERC721, ERC721URIStorage ${erc721.features.enumerable ? ", ERC721Enumerable" : ""} ${erc721.features.pausable ? ", ERC721Pausable" : ""}) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _burn(uint256 tokenId) internal virtual override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view virtual override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }\n`;
        }

        if (erc721.features?.autoIncrementIds) {
          imports.add(`import "@openzeppelin/contracts/utils/Counters.sol";`);
          contractBody += `    using Counters for Counters.Counter;\n`;
          contractBody += `    Counters.Counter private _tokenIdCounter;\n`;
        }

        if (erc721.baseUri?.trim()) {
            constructorBody += `        _setBaseURI("${erc721.baseUri.trim()}");\n`;
        }

        if (erc721.features?.mintable) {
          contractBody += `
    function safeMint(address to${erc721.features.autoIncrementIds ? "" : ", uint256 tokenId"}${erc721.features.uriStorage ? ", string memory uri" : ""}) public virtual onlyOwner {`;
          if (erc721.features.autoIncrementIds) {
            contractBody += `
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);`;
          } else {
            contractBody += `
        _safeMint(to, tokenId);`;
          }
          if (erc721.features.uriStorage) {
            contractBody += `
        _setTokenURI(tokenId, uri);`;
          }
          contractBody += `
    }\n`;
        }

        code = `${Array.from(imports).join("\n")}\n\ncontract ${contractSolName} is ${Array.from(inheritance).join(", ")} {\n`;
        code += `    constructor(${constructorArgs}) ${erc721ConstructorCall} {\n`;
        code += constructorBody;
        code += `    }\n`;
        if(erc721.baseUri?.trim() && !erc721.features?.uriStorage){ // Base URI function if not using URIStorage
            contractBody += `
    function _baseURI() internal pure override returns (string memory) {
        return "${erc721.baseUri.trim()}";
    }\n`
        }
        code += contractBody;
        code += `}\n`;
        break;

      case 'ERC1155':
        const erc1155 = config as ERC1155Config;
        inheritance.add("ERC1155");
        imports.add(`import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";`);
        imports.add(`import "@openzeppelin/contracts/access/Ownable.sol";`); // Always Ownable for minting control
        inheritance.add("Ownable");

        constructorArgs = `address initialOwner, string memory _uri`;
        let erc1155ConstructorCall = `ERC1155(_uri) Ownable(initialOwner)`;

        if (erc1155.features?.burnable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";`);
          inheritance.add("ERC1155Burnable");
        }
        if (erc1155.features?.pausable) {
          imports.add(`import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol";`);
          inheritance.add("ERC1155Pausable");
          contractBody += `
    function pause() public virtual onlyOwner {
        _pause();
    }

    function unpause() public virtual onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal virtual override(ERC1155, ERC1155Pausable) {
        super._update(from, to, ids, values, data);
    }\n`;
        }
        if (erc1155.features?.supplyTracking) {
          imports.add(`import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";`);
          inheritance.add("ERC1155Supply");
           contractBody +=`
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values, bytes memory data) internal virtual override(ERC1155, ERC1155Supply ${erc1155.features.pausable ? ", ERC1155Pausable" : ""}) {
        super._update(from, to, ids, values, data);
    }\n`;
        }

        if (erc1155.features?.mintable) {
          contractBody += `
    function mint(address account, uint256 id, uint256 amount, bytes memory data) public virtual onlyOwner {
        _mint(account, id, amount, data);
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data) public virtual onlyOwner {
        _mintBatch(to, ids, amounts, data);
    }\n`;
        }

        code = `${Array.from(imports).join("\n")}\n\ncontract ${contractSolName} is ${Array.from(inheritance).join(", ")} {\n`;
        code += `    constructor(${constructorArgs}) ${erc1155ConstructorCall} {\n`;
        code += constructorBody; // URI is set in constructor call
        code += `    }\n`;
        code += contractBody;
        code += `}\n`;
        break;
      default:
        code = `// Unsupported token standard: ${config.standard}\n`;
    }

    set({ generatedCode: code, isGenerating: false });
  },

  resetConfig: () => {
    set({ tokenConfig: initialConfig, selectedStandard: null, generatedCode: null, isGenerating: false });
  },
  setGeneratedCode: (code: string) => {
    set({ generatedCode: code });
  }
}));

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { FunctionTemplate, TemplateCategory } from '../types/smartcontract';

interface FunctionTemplateState {
  templates: FunctionTemplate[];
  getTemplates: () => FunctionTemplate[];
  getTemplatesByCategory: (category: TemplateCategory) => FunctionTemplate[];
}

const mockTemplates: FunctionTemplate[] = [
  // Access Control
  {
    id: uuidv4(),
    name: 'Ownable: Constructor',
    description: 'Initializes contract ownership to the deployer.',
    category: 'Access Control',
    parameters: [],
    codeSnippet:
      `address public owner;\n\nconstructor() {\n    owner = msg.sender;\n}`,
  },
  {
    id: uuidv4(),
    name: 'Ownable: onlyOwner Modifier',
    description: 'Modifier to restrict function access to the owner.',
    category: 'Access Control',
    parameters: [],
    codeSnippet:
      `modifier onlyOwner() {\n    require(msg.sender == owner, "Ownable: caller is not the owner");\n    _;\n}`,
  },
  {
    id: uuidv4(),
    name: 'Ownable: Transfer Ownership',
    description: 'Allows the current owner to transfer contract ownership.',
    category: 'Access Control',
    parameters: [{ name: 'newOwner', type: 'address', description: 'The address of the new owner.' }],
    codeSnippet:
      `function transferOwnership(address newOwner) public virtual onlyOwner {\n    require(newOwner != address(0), "Ownable: new owner is the zero address");\n    owner = newOwner;\n    emit OwnershipTransferred(msg.sender, newOwner);\n}`,
  },
  // Math
  {
    id: uuidv4(),
    name: 'SafeMath: Add',
    description: 'Adds two numbers, reverting on overflow (conceptual).',
    category: 'Math Operations',
    parameters: [
      { name: 'a', type: 'uint256', description: 'First number.' },
      { name: 'b', type: 'uint256', description: 'Second number.' },
    ],
    codeSnippet:
      `function add(uint256 a, uint256 b) internal pure returns (uint256) {\n    uint256 c = a + b;\n    require(c >= a, "SafeMath: addition overflow");\n    return c;\n}`,
  },
  // Token Logic (ERC20 example)
  {
    id: uuidv4(),
    name: 'ERC20: Simple Transfer',
    description: 'A basic token transfer function.',
    category: 'Token Standards (ERC20/ERC721)',
    parameters: [
      { name: 'recipient', type: 'address', description: 'The address receiving the tokens.' },
      { name: 'amount', type: 'uint256', description: 'The amount of tokens to transfer.' },
    ],
    codeSnippet:
      `mapping(address => uint256) private _balances;\n\nfunction transfer(address recipient, uint256 amount) public virtual returns (bool) {\n    require(recipient != address(0), "ERC20: transfer to the zero address");\n    require(_balances[msg.sender] >= amount, "ERC20: transfer amount exceeds balance");\n\n    _balances[msg.sender] -= amount;\n    _balances[recipient] += amount;\n\n    emit Transfer(msg.sender, recipient, amount);\n    return true;\n}`,
  },
  // Events
  {
    id: uuidv4(),
    name: 'Simple Event Declaration',
    description: 'Declares a basic event.',
    category: 'Events',
    parameters: [
        { name: 'value', type: 'uint256', description: 'A value to include in the event.'},
        { name: 'message', type: 'string memory', description: 'A message for the event.'}
    ],
    codeSnippet: `event ValueChanged(address indexed user, uint256 oldValue, uint256 newValue, string message);`,
  },
  {
    id: uuidv4(),
    name: 'Emit Event',
    description: 'Emits a declared event.',
    category: 'Events',
    parameters: [ { name: 'newValue', type: 'uint256', description: 'The new value.'} ],
    codeSnippet: `// Assuming 'ValueChanged' event is declared and 'someStateVar' exists\n// someStateVar = newValue;\n// emit ValueChanged(msg.sender, oldValue, newValue, "State variable updated");`,
  },
  // Basic Functions
  {
    id: uuidv4(),
    name: 'Simple Getter Function',
    description: 'Returns the value of a public state variable (conceptual).',
    category: 'Basic Functions',
    parameters: [],
    codeSnippet: `uint256 public myVariable;\n\nfunction getMyVariable() public view returns (uint256) {\n    return myVariable;\n}`,
  },
  {
    id: uuidv4(),
    name: 'Simple Setter Function',
    description: 'Sets the value of a state variable.',
    category: 'Basic Functions',
    parameters: [{ name: '_newValue', type: 'uint256', description: 'The new value for myVariable.' }],
    codeSnippet: `// Assuming 'myVariable' is declared as: uint256 public myVariable;\nfunction setMyVariable(uint256 _newValue) public {\n    myVariable = _newValue;\n}`,
  },
   // State Variables
  {
    id: uuidv4(),
    name: 'Address State Variable',
    description: 'Declares an address state variable.',
    category: 'State Variables',
    parameters: [],
    codeSnippet: `address public adminAddress;`,
  },
  {
    id: uuidv4(),
    name: 'Mapping State Variable',
    description: 'Declares a mapping from address to uint.',
    category: 'State Variables',
    parameters: [],
    codeSnippet: `mapping(address => uint256) public userBalances;`,
  },
];

export const useFunctionTemplateStore = create<FunctionTemplateState>((set, get) => ({
  templates: mockTemplates,
  getTemplates: () => get().templates,
  getTemplatesByCategory: (category: TemplateCategory) =>
    get().templates.filter((template) => template.category === category),
}));

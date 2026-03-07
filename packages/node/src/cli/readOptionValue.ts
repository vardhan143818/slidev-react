export interface OptionValueReadResult {
  value: string;
  nextIndex: number;
}

export function readOptionValue(
  argv: string[],
  index: number,
  optionName: string,
): OptionValueReadResult {
  const current = argv[index];
  if (current.startsWith(`${optionName}=`)) {
    return {
      value: current.slice(optionName.length + 1),
      nextIndex: index,
    };
  }

  const nextValue = argv[index + 1];
  if (!nextValue || nextValue.startsWith("--")) {
    throw new Error(`Missing value for ${optionName}.`);
  }

  return {
    value: nextValue,
    nextIndex: index + 1,
  };
}

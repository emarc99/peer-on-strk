import BN from 'bn.js';
export const searchResources = async ({
  resources,
  search,
}: {
  search: string;
  resources: any;
}) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const lowerCaseSearch = search.toLocaleLowerCase();

  return resources.filter((resource: any) =>
    Object.values(resource).some(
      (value) =>
        typeof value === "string" &&
        value.toLocaleLowerCase().includes(lowerCaseSearch),
    ),
  );
};


export const formatCurrency = (currency: number) => {
  let amount = currency / 1e18;
  return amount || 0;
}



export const formatDate = (isoString: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", options);
}


function asciiToHex(str: string) {
  if (typeof str !== 'string') {
      throw new TypeError('Input must be a string');
  }
  return '0x' + Buffer.from(str).toString('hex');
}


export function toHex(value: string) {
  if (typeof value !== 'string') {
    throw new TypeError('Input must be a string');
  }
  if (value.length === 0) return '';
  // Strict hex format validation
  if (/^0x[0-9a-fA-F]+$/.test(value)) {
        return value;
    }

  // Strict numeric validation
  if (/^[0-9]+$/.test(value)) {
      try {
          const bnValue = new BN(value, 10);
          // Pad to 32 bytes (64 hex characters) for Ethereum compatibility
            const hex = bnValue.toString(16);
            const paddedHex = hex.padStart(64, '0');
            return `0x${paddedHex}`;
      } catch (error) {
          throw new Error(`Invalid numeric value: ${value}`);
      }
    }
    return asciiToHex(value);
  }

export async function getCryptoPrices() {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,starknet&vs_currencies=usd');
    const data = await response.json();
    return {
      eth: data.ethereum.usd,
      strk: data.starknet.usd,
    };
  } catch (error) {
    console.error('Error fetching crypto prices:', error);
    return { eth: 0, strk: 0 };
  }
}

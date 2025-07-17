import { Address, GetSignaturesForAddressApi } from "gill";
import { useSignaturesForAddress } from "../hooks";

// [DESCRIBE] useSignaturesForAddress
{
  const address = null as unknown as Address;

  {
    const { signatures } = useSignaturesForAddress({ address });
    signatures satisfies ReturnType<GetSignaturesForAddressApi["getSignaturesForAddress"]>;

    // @ts-expect-error - Should not allow no argument
    useSignaturesForAddress();

    // @ts-expect-error - Should not allow empty argument object
    useSignaturesForAddress({});
  }

  {
    const { signatures } = useSignaturesForAddress({
      address,
      config: { limit: 10 },
    });
    signatures satisfies ReturnType<GetSignaturesForAddressApi["getSignaturesForAddress"]>;
  }
}

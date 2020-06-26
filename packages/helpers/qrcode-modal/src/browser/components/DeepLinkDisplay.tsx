import * as React from "react";
import MobileRegistry from "@walletconnect/mobile-registry";
import { IMobileRegistryEntry } from "@walletconnect/types";
import { isIOS, deeplinkChoiceKey, setLocal } from "@walletconnect/utils";

import { DEFAULT_BUTTON_COLOR, WALLETCONNECT_CTA_TEXT_ID } from "../constants";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ConnectButton from "./ConnectButton";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import WalletButton from "./WalletButton";

function formatIOSDeepLink(uri: string, entry: IMobileRegistryEntry) {
  const encodedUri: string = encodeURIComponent(uri);
  return entry.universalLink
    ? `${entry.universalLink}/wc?uri=${encodedUri}`
    : entry.deepLink
    ? `${entry.deepLink}${entry.deepLink.endsWith(":") ? "//" : "/"}wc?uri=${encodedUri}`
    : "";
}

function saveDeeplinkInfo(data: IDeeplinkInfo) {
  const focusUri = data.href.split("?")[0];

  setLocal(deeplinkChoiceKey, {
    ...data,
    href: focusUri,
  });
}

interface IDeeplinkInfo {
  name: string;
  href: string;
}
interface DeepLinkDisplayProps {
  text: { [key: string]: string };
  uri: string;
}

function DeepLinkDisplay(props: DeepLinkDisplayProps) {
  const ios = isIOS();
  return (
    <div>
      <p id={WALLETCONNECT_CTA_TEXT_ID} className="walletconnect-qrcode__text">
        {ios ? props.text.choose_preferred_wallet : props.text.connect_mobile_wallet}
      </p>
      <div className={`walletconnect-connect__buttons__wrapper${!ios && "__android"}`}>
        {ios ? (
          MobileRegistry.map((entry: IMobileRegistryEntry) => {
            const { color, name, logo } = entry;
            const href = formatIOSDeepLink(props.uri, entry);
            const handleClickIOS = React.useCallback(() => {
              saveDeeplinkInfo({
                name,
                href,
              });
            }, []);
            return (
              <WalletButton
                color={color}
                href={href}
                name={name}
                logo={logo}
                onClick={handleClickIOS}
              />
            );
          })
        ) : (
          <ConnectButton
            name={props.text.connect}
            color={DEFAULT_BUTTON_COLOR}
            href={props.uri}
            onClick={React.useCallback(() => {
              saveDeeplinkInfo({
                name: "Unknown",
                href: props.uri,
              });
            }, [])}
          />
        )}
      </div>
    </div>
  );
}

export default DeepLinkDisplay;

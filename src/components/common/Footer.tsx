/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * Footer component
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import React, { Suspense } from "react";
import { withTranslation } from "react-i18next";
import FooterUpdateStatus from "./FooterUpdateStatus";
import FooterDonateLinks from "./FooterDonateLinks";

const Footer = (props: any) => {
  return (
    <footer className="app-footer">
      <FooterDonateLinks />
      <FooterUpdateStatus {...props} />
    </footer>
  );
};

const TranslatedFooter = withTranslation(["common", "footer"])(Footer);

export default () => (
  <Suspense fallback={null}>
    <TranslatedFooter />
  </Suspense>
);

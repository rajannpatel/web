/* Pi-hole: A black hole for Internet advertisements
 * (c) 2019 Pi-hole, LLC (https://pi-hole.net)
 * Network-wide ad blocking via your own hardware.
 *
 * Web Interface
 * FooterDonateLinks component
 *
 * This file is copyright under the latest version of the EUPL.
 * Please see LICENSE file for your rights under this license. */

import React from "react";
import { withTranslation } from "react-i18next";

const FooterDonateLinks = (props: any) => {
  const { t } = props;
  return (
    <div>
      <a
        className="bold"
        id="donatePaypal"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&amp;hosted_button_id=3J2L3Z4DHW9UY"
      >
        <i className="fab fa-paypal pr6" />
        {t("Donate")}
      </a>{" "}
      {t("if you found this useful")}
    </div>
  );
};

export default withTranslation("footer")(FooterDonateLinks);

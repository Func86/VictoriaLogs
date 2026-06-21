import { FC, useEffect, useState, useMemo, useRef } from "preact/compat";
import { useSearchParams } from "react-router-dom";
import { useFetchAccountIds } from "./hooks/useFetchAccountIds";
import TenantsSelect from "./TenantsSelect";
import Button from "../../../Main/Button/Button";
import classNames from "classnames";
import Tooltip from "../../../Main/Tooltip/Tooltip";
import useDeviceDetect from "../../../../hooks/useDeviceDetect";
import useBoolean from "../../../../hooks/useBoolean";
import Popper from "../../../Main/Popper/Popper";
import { ArrowDownIcon, StorageIcon } from "../../../Main/Icons";
import "./style.scss";
import "../../TimeRangeSettings/ExecutionControls/style.scss";

export type TenantType = {
  accountId: string;
  projectId: string;
}

const Tenants: FC = () => {
  const { tenants, defaultTenant, isLoading, error } = useFetchAccountIds();
  const { isMobile } = useDeviceDetect();

  const [searchParams, setSearchParams] = useSearchParams();
  const accountId = searchParams.get("accountID") || "0";
  const projectId = searchParams.get("projectID") || "0";
  const tenantId = `${accountId}:${projectId}`;
  const selectedTenant = useMemo(
    () => tenants.find((tenant) => `${tenant.accountID}:${tenant.projectID}` === tenantId),
    [tenantId, tenants]
  );
  const selectedLabel = selectedTenant?.label || (isLoading ? "Loading tenant" : "Select tenant");

  const buttonRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");

  const {
    value: openPopup,
    toggle: toggleOpenPopup,
    setFalse: handleClosePopup,
  } = useBoolean(false);

  const onChange = ({ accountId, projectId }: Partial<TenantType>) => {
    const next = new URLSearchParams(searchParams);
    if (accountId) next.set("accountID", accountId);
    if (projectId) next.set("projectID", projectId);
    setSearchParams(next);
    handleClosePopup();
  };

  useEffect(() => {
    if (accountId !== "0" || projectId !== "0" || !defaultTenant) return;

    const next = new URLSearchParams(searchParams);
    next.set("accountID", defaultTenant.accountID);
    next.set("projectID", defaultTenant.projectID);
    setSearchParams(next, { replace: true });
  }, [accountId, defaultTenant, projectId, searchParams, setSearchParams]);

  const childrenProps = {
    tenantId,
    tenants,
    accountId,
    projectId,
    search,
    onSearch: setSearch,
    onChange,
  };

  return (
    <div className="vm-tenant-input">
      <Tooltip title="Define Tenant ID if you need request to another storage">
        <div ref={buttonRef}>
          {isMobile ? (
            <div
              className="vm-mobile-option"
              onClick={toggleOpenPopup}
            >
              <span className="vm-mobile-option__icon"><StorageIcon/></span>
              <div className="vm-mobile-option-text">
                <span className="vm-mobile-option-text__label">Tenant</span>
                <span className="vm-mobile-option-text__value">{selectedLabel}</span>
              </div>
              <span className="vm-mobile-option__arrow"><ArrowDownIcon/></span>
            </div>
          ) : (
            <Button
              className="vm-header-button"
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<StorageIcon/>}
              endIcon={(
                <div
                  className={classNames({
                    "vm-execution-controls-buttons__arrow": true,
                    "vm-execution-controls-buttons__arrow_open": openPopup,
                  })}
                >
                  <ArrowDownIcon/>
                </div>
              )}
              onClick={toggleOpenPopup}
            >
              {selectedLabel}
            </Button>
          )}
        </div>
      </Tooltip>
      <Popper
        open={openPopup}
        placement="bottom-right"
        onClose={handleClosePopup}
        buttonRef={buttonRef}
        title={isMobile ? "Tenant" : undefined}
      >
        {tenants.length ? (
          <TenantsSelect {...childrenProps}/>
        ) : (
          <div className="vm-list vm-tenant-input-list">
            <div className="vm-tenant-input-list__fields">{error || "No tenants available"}</div>
          </div>
        )}
      </Popper>
    </div>
  );
};

export default Tenants;

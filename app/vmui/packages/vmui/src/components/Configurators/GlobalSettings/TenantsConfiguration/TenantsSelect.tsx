import { FC, useMemo } from "preact/compat";
import useDeviceDetect from "../../../../hooks/useDeviceDetect";
import classNames from "classnames";
import TextField from "../../../Main/TextField/TextField";
import { TenantType } from "./Tenants";
import { LogsSessionTenant } from "./hooks/useFetchAccountIds";
import Button from "../../../Main/Button/Button";
import { LOGS_DOCS_URL } from "../../../../constants/logs";

interface Props extends TenantType {
  tenants: LogsSessionTenant[];
  tenantId: string;
  search: string;
  onSearch: (value: string) => void;
  onChange: (tenant: Partial<TenantType>) => void;
}

const tenantKey = (tenant: LogsSessionTenant) => `${tenant.accountID}:${tenant.projectID}`;

const TenantsSelect: FC<Props> = ({ tenants, tenantId, search, onSearch, onChange }) => {
  const { isMobile } = useDeviceDetect();

  const tenantsFiltered = useMemo(() => {
    if (!search) return tenants;
    try {
      const regexp = new RegExp(search, "i");
      return tenants.filter((tenant) => regexp.test(tenant.label) || regexp.test(tenantKey(tenant)));
    } catch (e) {
      return [];
    }
  }, [search, tenants]);

  const createHandlerChange = (tenant: LogsSessionTenant) => () => {
    onChange({ accountId: tenant.accountID, projectId: tenant.projectID });
  };

  return (
    <div
      className={classNames({
        "vm-list vm-tenant-input-list": true,
        "vm-list vm-tenant-input-list_mobile": isMobile,
      })}
    >
      <div className="vm-tenant-input-list__search">
        <TextField
          autofocus
          label="Search"
          value={search}
          onChange={onSearch}
          type="search"
        />
      </div>
      {tenantsFiltered.map(tenant => (
        <div
          className={classNames({
            "vm-list-item": true,
            "vm-list-item_mobile": isMobile,
            "vm-list-item_active": tenantKey(tenant) === tenantId
          })}
          key={tenantKey(tenant)}
          onClick={createHandlerChange(tenant)}
        >
          {tenant.label}
        </div>
      ))}
      <div className="vm-tenant-input-list__buttons">
        <Button
          as="a"
          href={`${LOGS_DOCS_URL}/#multitenancy`}
          target="_blank"
          rel="help noreferrer"
          variant="text"
          color="primary"
        >
          Multitenancy docs
        </Button>
      </div>
    </div>
  );
};

export default TenantsSelect;

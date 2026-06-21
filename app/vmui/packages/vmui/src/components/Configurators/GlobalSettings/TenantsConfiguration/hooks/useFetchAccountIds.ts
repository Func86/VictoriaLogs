import { useAppState } from "../../../../../state/common/StateContext";
import { useEffect, useMemo, useState } from "preact/compat";
import { ErrorTypes } from "../../../../../types";

export interface LogsSessionTenant {
  label: string;
  accountID: string;
  projectID: string;
}

interface LogsSession {
  tenants: LogsSessionTenant[];
  defaultTenant: Pick<LogsSessionTenant, "accountID" | "projectID"> | null;
}

export const useFetchAccountIds = () => {
  const { serverUrl } = useAppState();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ErrorTypes | string>();
  const [tenants, setTenants] = useState<LogsSessionTenant[]>([]);
  const [defaultTenant, setDefaultTenant] = useState<LogsSession["defaultTenant"]>(null);

  const fetchUrl = useMemo(() => {
    const url = new URL(`${serverUrl}/_gateway/auth/session`);
    if (window.location.hash.startsWith("#/")) {
      url.searchParams.set("return_hash", window.location.hash);
    }
    return url.toString();
  }, [serverUrl]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(fetchUrl);
        if (await handleLogsSessionExpired(response)) return;
        if (!response.ok) {
          setError(await response.text());
          return;
        }
        const session = await response.json() as LogsSession;
        setTenants(session.tenants.sort((a, b) => a.label.localeCompare(b.label)));
        setDefaultTenant(session.defaultTenant);
      } catch (e) {
        if (e instanceof Error) {
          setError(`${e.name}: ${e.message}`);
        }
      }
      setIsLoading(false);
    };

    fetchData().catch(console.error);
  }, [fetchUrl]);

  return { tenants, defaultTenant, isLoading, error };
};

const handleLogsSessionExpired = async (response: Response): Promise<boolean> => {
  if (response.status !== 401) return false;

  try {
    const body = await response.clone().json();
    if (isRecord(body) && body.error === "logs_session_expired" && typeof body.loginUrl === "string") {
      window.location.assign(body.loginUrl);
      return true;
    }
  } catch (_e) {
    return false;
  }

  return false;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

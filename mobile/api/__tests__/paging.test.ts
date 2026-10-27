import { NO_MATCH_ID, toParams } from "@/api/paging";
import { resolveBloodTypeId } from "@/utils/resolveBloodTypeId";

jest.mock("@/features/auth/services/authToken.store", () => ({ getAccessToken: () => null }));

describe("toParams", () => {
  it("sends only the filters the user filled in, trimmed", () => {
    expect(toParams({ search: "  ana ", city: "", bloodTypeId: undefined, page: 2, priority: false, donationTypeId: null }))
      .toEqual({ search: "ana", page: "2", priority: "false" });
  });
});

describe("resolveBloodTypeId", () => {
  const bloodTypes = [{ id: "id-a" as unknown as number, name: "A+", image: "" }];

  it("no chip selected: no filter", () => {
    expect(resolveBloodTypeId(undefined, bloodTypes)).toBeUndefined();
  });

  it("maps the chip name to the API id, ignoring case", () => {
    expect(resolveBloodTypeId("a+", bloodTypes)).toBe("id-a");
  });

  it("a name the API doesn't have matches nothing instead of everything", () => {
    expect(resolveBloodTypeId("AB-", bloodTypes)).toBe(NO_MATCH_ID);
  });
});

import { useCallback, useEffect, useMemo, useState } from "react";
import { HiTrash, HiCube, HiPencilSquare } from "react-icons/hi2";
import { IoMdArrowDropup, IoMdArrowDropdown } from "react-icons/io";
import { IoSearch, IoClose } from "react-icons/io5";
import { TbLoader2 } from "react-icons/tb";
import { getProducts } from "../../../services/api";
import { toast } from "../../../lib/toast";
import { useAuth } from "../../../context/AuthContext";
import ProductGroupManagementPage from "./components/PGManagement";

/* ---- Model ---- */
import ProductModal from "./components/ProductModel";
import DeleteConfrim from "./components/DeleteConfrim";

export default function ProductManagementPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [page, setPage] = useState(1);
  const [tap, setTap] = useState("product");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const [deleteModel, setDeleteModel] = useState(null);

  const canEdit = user && user.role === "admin";

  const PAGE_SIZE = 20;

  const fetch = useCallback(() => {
    setLoading(true);
    getProducts()
      .then((res) => {
        setProducts(res.data);
      })
      .catch((e) => toast.error(`Failed to load products: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const filteredData = useMemo(() => {
    let result = products.filter((item) => {
      const keyword = search.trim().toLowerCase();
      if (!keyword) return true;

      return (
        String(item.product_code || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.product_group_name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(item.product_description || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        const valA = String(a[sortConfig.key] || "");
        const valB = String(b[sortConfig.key] || "");
        if (sortConfig.direction === "asc") {
          return valA.localeCompare(valB, undefined, { numeric: true });
        } else {
          return valB.localeCompare(valA, undefined, { numeric: true });
        }
      });
    }

    return result;
  }, [products, search, sortConfig]);

  const handleSaved = () => {
    setLoading(false);
    setModal(null);
    setDeleteModel(null);
    fetch(true);
  };

  const handleSort = (key, isAscending) => {
    setSortConfig({
      key: key,
      direction: isAscending ? "asc" : "desc",
    });
  };

  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const productsData = filteredData.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="pb-10">
      <div className="flex items-center justify-start">
        {["product", "product-group"].map((e, i) => (
          <div
            key={i}
            onClick={() => setTap(e)}
            className={`rounded-t-2xl border py-2 px-6 shadow-sm  border-b-2 cursor-pointer font-bold
            ${tap == e ? "border-blue-600 text-white bg-blue-800" : "border-gray-200 bg-white hover:bg-blue-100 hover:text-blue-700"}`}
          >
            {e == "product" ? "Product" : "Product Group"}
          </div>
        ))}
      </div>
      {tap == "product" ? (
        <div className="bg-white rounded-b-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-2  border-b border-gray-100">
              <HiCube className="text-gray-400 text-lg" />
              <span className="font-black text-gray-800">Product</span>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full ml-1 w-8 h-8 flex items-center justify-center">
                {filteredData.length}
              </span>
              <div className="flex flex-col gap-1">
                <div className="relative w-[280px]">
                  <IoSearch
                    size={15}
                    className=" absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none cursor-pointer"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search Product Code / Group..."
                    className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-9 text-sm text-gray-700 outline-none transition-all duration-200
                placeholder:text-gray-400 hover:border-blue-300 hover:bg-white focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 "
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                      }}
                      className=" absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
                    >
                      <IoClose size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-xl p-1">
              {canEdit && (
                <button
                  type="button"
                  onClick={() => setModal({ mode: "create" })}
                  className={`h-10 flex items-center gap-2 px-6 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-200 cursor-pointer`}
                >
                  Add Product
                </button>
              )}
            </div>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <TbLoader2 className="text-2xl text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-[11px] font-bold text-gray-600 uppercase tracking-wide w-12">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      <div className="flex items-center gap-1">
                        Product Code
                        <div className="flex flex-col text-lg -space-y-2 cursor-pointer">
                          <IoMdArrowDropup
                            className={`hover:text-teal-600 transition-colors ${sortConfig.key === "product_code" && sortConfig.direction === "desc" ? "text-teal-600" : "text-gray-400"}`}
                            onClick={() => handleSort("product_code", false)}
                          />
                          <IoMdArrowDropdown
                            className={`hover:text-teal-600 transition-colors ${sortConfig.key === "product_code" && sortConfig.direction === "asc" ? "text-teal-600" : "text-gray-400"}`}
                            onClick={() => handleSort("product_code", true)}
                          />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      <div className="flex items-center gap-1">
                        Product Group
                        <div className="flex flex-col text-lg -space-y-2 cursor-pointer">
                          <IoMdArrowDropup
                            className={`hover:text-teal-600 transition-colors ${sortConfig.key === "product_group_name" && sortConfig.direction === "desc" ? "text-teal-600" : "text-gray-400"}`}
                            onClick={() =>
                              handleSort("product_group_name", false)
                            }
                          />
                          <IoMdArrowDropdown
                            className={`hover:text-teal-600 transition-colors ${sortConfig.key === "product_group_name" && sortConfig.direction === "asc" ? "text-teal-600" : "text-gray-400"}`}
                            onClick={() =>
                              handleSort("product_group_name", true)
                            }
                          />
                        </div>
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      Capacity (Pcs/hr)
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      MC Speed (Pcs/hr)
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      People
                    </th>
                    <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide">
                      status
                    </th>
                    {canEdit && (
                      <th className="px-6 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide w-20">
                        action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productsData.map((e, i) => (
                    <tr
                      key={e.product_id}
                      className={` transition-colors ${
                        e.is_active
                          ? "bg-teal-100/10 hover:bg-teal-100/30"
                          : "bg-gray-200/70 hover:bg-gray-300/60"
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-900 tabular-nums">
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-800">
                        {e.product_code}
                      </td>
                      <td className="px-6 py-3 text-gray-600 max-w-xs truncate">
                        {e.product_description || "-"}
                      </td>
                      <td className="px-6 py-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                          {e.product_group_name}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-700 tabular-nums">
                        {e.capacity_pcs_hr ?? "-"}
                      </td>
                      <td className="px-6 py-3 text-gray-700 tabular-nums">
                        {e.mc_speed_pcs_hr ?? "-"}
                      </td>
                      <td className="px-6 py-3 text-gray-700 tabular-nums">
                        {e.product_people ?? "-"}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                            e.is_active
                              ? "bg-green-100 text-green-700 border border-green-300"
                              : "bg-gray-300 text-gray-700 border-gray-700"
                          }`}
                        >
                          {e.is_active ? "active" : "disable"}
                        </span>
                      </td>
                      {canEdit && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                setModal({ mode: "edit", data: e })
                              }
                              title="Edit"
                              className="w-8 h-8 flex items-center justify-center text-blue-500 hover:bg-blue-100 rounded-lg transition"
                            >
                              <HiPencilSquare className="text-base" />
                            </button>
                            <button
                              onClick={() => setDeleteModel(e)}
                              title="Delete"
                              className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-100 rounded-lg transition"
                            >
                              <HiTrash className="text-base" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-1 px-6 py-3 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => prev - 1)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed  cursor-pointer transition"
                  >
                    Prev
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1,
                  ).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold cursor-pointer transition
                    ${p === page ? "bg-blue-700 text-white" : "border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600"}`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className=" px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600
                  disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <ProductGroupManagementPage />
      )}

      {/* modals */}
      {modal && (
        <ProductModal
          mode={modal.mode}
          initialData={modal.data}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteModel && (
        <DeleteConfrim
          record={deleteModel}
          onClose={() => setDeleteModel(null)}
          onDeleted={handleSaved}
          feture="product"
        />
      )}
    </div>
  );
}

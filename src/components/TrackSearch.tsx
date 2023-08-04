import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
type SearchProps = {
  maxResults?: number;
};

const ProductSearch = ({ maxResults = 5 }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const session = useSession();

  const router = useRouter();

  const getPublicPlaylists = api.playlist.getMe.useQuery();

  return (
    <div className=" flex flex-col">
      {/* <div
        className={`flex bg-white ${
          false ? " rounded-t-md" : " rounded-md"
        } items-center gap-2 p-2`} //filtered.length > 0
      >
        <input
          className=" rounded-lg border-none bg-white  px-5  text-black"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <X
          size={25}
          color="black"
          onClick={() => setSearchTerm("")}
          className="cursor-pointer"
        />
      </div> */}
      <pre className="  z-50 w-20 rounded-b p-2">
        {JSON.stringify(getPublicPlaylists.data, null, 2)}
      </pre>

      {/* {filtered.length > 0 && (
        <div className="absolute top-full z-50 w-full rounded-b bg-white p-2">
          {filtered.map((v) => formatResult(v))}
        </div>
      )} */}
    </div>
  );
};

export default ProductSearch;

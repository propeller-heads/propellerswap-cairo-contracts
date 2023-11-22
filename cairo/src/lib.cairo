mod interfaces {
    mod IERC20;
}

mod swap_methods {
    mod interface;
    mod jediswap_v1;
    mod ten_k_swap_v1;
}
mod swap_routers {
    mod swap_router_v1 {
        mod interface;
        mod structs;
        mod frontend_swap_router_v1;
        mod swap_router_v1;
    }
}


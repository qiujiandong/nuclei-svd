const allUnits = [
  {
    unit: "iinfo",
    offset: "0x0000",
    size: "64KB",
    description: "Some internal information is defined here by memory map registers. IINFO shows internal peripherals configurations or controls some micro-architecture functions.",
    regs: [
      {
        name: "mpasize",
        description: "Physical Size register. Shows the physical address size supported by the hardware.",
        permission: "MRO",
        offset: "0x0000",
        fields: [
          { bits: "31:0", name: "PA_SIZE", type: "RO", description: "Physical Size. If the PA_SIZE is 48, the number of this register is 48." }
        ]
      },
      {
        name: "cmo_info",
        description: "Shows Nuclei series RISC-V Standard CMO implementation information.",
        permission: "MRO",
        offset: "0x0004",
        fields: [
          { bits: "31:10", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "9:6", name: "cbozero_size", type: "RO", description: "The size of the cache block for cbo.zero instructions.<br>0: 4 bytes<br>1: 8 bytes<br>2: 16 bytes<br>3: 32 bytes<br>4: 64 bytes<br>5: 128 bytes<br>6: 256 bytes<br>7: 512 bytes" },
          { bits: "5:2", name: "cmo_size", type: "RO", description: "The size of the cache block for management and prefetch instructions.<br>0: 4 bytes<br>1: 8 bytes<br>2: 16 bytes<br>3: 32 bytes<br>4: 64 bytes<br>5: 128 bytes<br>6: 256 bytes<br>7: 512 bytes<br>Currently in Nuclei series core, the size is same with D-Cache cacheline." },
          { bits: "1", name: "cmo_pft", type: "RO", description: "Global configuration for CMO Extension's prefetch support:<br>0: No CMO Extension's prefetch support, the prefetch.i/prefetch.r/prefetch.w are all implemented as nop.<br>1: Has CMO Extension's prefetch support." },
          { bits: "0", name: "cmo_cfg", type: "RO", description: "Global configuration for CMO Extension support:<br>0: No CMO Extension support.<br>1: Has CMO Extension support.<br>Currently in Nuclei series core, if there is D-Cache or I-Cache, then it has CMO support." }
        ]
      },
      {
        name: "sec_base_addr_lo",
        description: "Shows the external security controller lower 32-bit base address information.",
        permission: "MRO",
        offset: "0x0008",
        fields: [
          { bits: "31:0", name: "sec_base_addr_lo", type: "RO", description: "Security controller base address low." }
        ]
      },
      {
        name: "sec_base_addr_hi",
        description: "Shows the external security controller higher 32-bit base address information.",
        permission: "MRO",
        offset: "0x000C",
        fields: [
          { bits: "31:0", name: "sec_base_addr_hi", type: "RO", description: "Security controller base address high." }
        ]
      },
      {
        name: "sec_cfg_info",
        description: "Shows the security feature supported by CPU.",
        permission: "MRO",
        offset: "0x0010",
        fields: [
          { bits: "31:27", name: "BBOX_NUM", type: "RO", description: "The value of this field represents the number of black box debugging entries:<br>* 0: indicates that the current core does not support the black box debugging feature.<br>* Non-zero: indicates that the current core supports the black box debugging feature." },
          { bits: "26:22", name: "MPU_NUM", type: "RO", description: "The value of this field represents the number of mpu entries:<br>* 0: indicates that the current core does not support the mpu feature.<br>* Non-zero: indicates that the current core supports the mpu feature." },
          { bits: "21:18", name: "Reserved", type: "RO", description: "Reserved" },
          { bits: "17", name: "PARITY_MODE", type: "RO", description: "Parity mode, only active when parity_protection enable.<br>* 0: 1-bit parity check mode<br>* 1: 4-bit parity check mode." },
          { bits: "16", name: "BJP_RANDOM_FLUSH", type: "RO", description: "BJP instruction can send random flush feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "15", name: "STACK_CHECK", type: "RO", description: "Stack check feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "14", name: "POWER_DISTURB", type: "RO", description: "Power scrambling feature support.<br>* 0: Not support<br>* 1: Support" },
          { bits: "13", name: "RANDOM_INS_INSERT", type: "RO", description: "Random instruction insert feature support.<br>* 0: Not support<br>* 1: Support" },
          { bits: "12", name: "DATA_POLARITY", type: "RO", description: "Data polarity feature support.<br>* 0: Not support<br>* 1: Support" },
          { bits: "11", name: "KEY_STATE_CLEAR", type: "RO", description: "Key state clear feature support.<br>* 0: Not support<br>* 1: Support" },
          { bits: "10", name: "EXE_MONITOR", type: "RO", description: "Execution monitor feature support.<br>* 0: Not support<br>* 1: Support, Core will output some internal signal." },
          { bits: "9", name: "SEC_MON_BUS", type: "RO", description: "Security monitor bus feature support:<br>* 0: Not support<br>* 1: Support, Core will output some error information on this bus." },
          { bits: "8", name: "CACHE_FROZE", type: "RO", description: "Cache Frozen feature support:<br>* 0: Not support<br>* 1: Support, cache miss will not refill data into cache to protect the secure and critical code." },
          { bits: "7", name: "CCT", type: "RO", description: "Instruction execution time consistency feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "6", name: "PPI_LOCK", type: "RO", description: "PPI Lock feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "5", name: "TRWB", type: "RO", description: "Garbage register write-back feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "4", name: "PARITY_PROTECTION", type: "RO", description: "Register parity protection feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "3", name: "REMAP", type: "RO", description: "Vector table remap feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "2", name: "ARCG", type: "RO", description: "Architecture random clock gate feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "1", name: "SEC_DEBUG", type: "RO", description: "Secure debug feature support:<br>* 0: Not support<br>* 1: Support" },
          { bits: "0", name: "SECURITY", type: "RO", description: "Security feature support:<br>* 0: Not support<br>* 1: Support" }
        ]
      },
      {
        name: "mvlm_cfg_lo",
        description: "Shows the VLM configurations information (lower 32 bits).",
        permission: "MRO",
        offset: "0x0024",
        fields: [
          { bits: "31:10", name: "vlm_base_lo", type: "RO", description: "VLM base address [31:10]" },
          { bits: "9:6", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "5:1", name: "vlm_size", type: "RO", description: "0: 0 bytes<br>1: 1K bytes<br>2: 2K bytes<br>3: 4K bytes<br>4: 8K bytes<br>5: 16K bytes<br>6: 32K bytes<br>7: 64K bytes<br>8: 128K bytes<br>9: 256K bytes<br>10: 512K bytes<br>11: 1M bytes<br>12: 2M bytes<br>13: 4M bytes<br>14: 8M bytes<br>15: 16M bytes<br>16: 32M bytes<br>17: 64M bytes<br>18: 128M bytes<br>19: 256M bytes<br>20: 512M bytes<br>21: 1G bytes<br>22: 2G bytes<br>23: 4G bytes<br>others: reserved" },
          { bits: "0", name: "vlm", type: "RO", description: "Shows the hardware has VLM configuration or not. 0 means no, 1 means yes." }
        ]
      },
      {
        name: "mvlm_cfg_hi",
        description: "Shows the higher 32 bit of VLM base address.",
        permission: "MRO",
        offset: "0x0028",
        fields: [
          { bits: "31:0", name: "vlm_base_hi", type: "RO", description: "VLM base address high." }
        ]
      },
      {
        name: "flash_base_addr_lo",
        description: "Shows the flash bus configurations information (lower 32 bits).",
        permission: "MRO",
        offset: "0x002C",
        fields: [
          { bits: "31:10", name: "flash_base_lo", type: "RO", description: "flash bus base address [31:10]" },
          { bits: "9:6", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "5:1", name: "flash_size", type: "RO", description: "0: 0 bytes<br>1: 1K bytes<br>2: 2K bytes<br>3: 4K bytes<br>4: 8K bytes<br>5: 16K bytes<br>6: 32K bytes<br>7: 64K bytes<br>8: 128K bytes<br>9: 256K bytes<br>10: 512K bytes<br>11: 1M bytes<br>12: 2M bytes<br>13: 4M bytes<br>14: 8M bytes<br>15: 16M bytes<br>16: 32M bytes<br>17: 64M bytes<br>18: 128M bytes<br>19: 256M bytes<br>20: 512M bytes<br>21: 1G bytes<br>22: 2G bytes<br>23: 4G bytes<br>others: reserved" },
          { bits: "0", name: "flash", type: "RO", description: "Shows the hardware has flash bus configuration or not.<br>0: means no<br>1: means yes." }
        ]
      },
      {
        name: "flash_base_addr_hi",
        description: "Shows the higher 32 bit of flash bus base address.",
        permission: "MRO",
        offset: "0x0030",
        fields: [
          { bits: "31:0", name: "flash_base_hi", type: "RO", description: "Flash bus information" }
        ]
      },
      {
        name: "vpu_cfg_info",
        description: "Shows the VPU configurations information.",
        permission: "MRO",
        offset: "0x0050",
        fields: [
          { bits: "31:2", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "1", name: "elen64", type: "RO", description: "1: Support elen=64 when configure VPU<br>0: No support elen=64 when configure VPU" },
          { bits: "0", name: "nosegnoshuf", type: "RO", description: "1: No segment and no shuf feature when configure VPU<br>0: Support segment and shuf feature when configure VPU" }
        ]
      },
      {
        name: "mem_region0_cfg_lo",
        description: "Hardware memory-region0 information (lower 32 bits).",
        permission: "MRW",
        offset: "0x0054",
        fields: [
          { bits: "31:10", name: "mem_regionx_base_lo", type: "RO", description: "mem_regionx's low 32 bits base address(aligned 1k)" },
          { bits: "9", name: "mem_regionx_ena", type: "RW", description: "0: disable<br>1: enable" },
          { bits: "8:6", name: "Reserved", type: "RO", description: "reserved" },
          { bits: "5:1", name: "mem_regionx_size", type: "RO", description: "0: 0 bytes<br>1: 1K bytes<br>2: 2K bytes<br>3: 4K bytes<br>4: 8K bytes<br>5: 16K bytes<br>6: 32K bytes<br>7: 64K bytes<br>8: 128K bytes<br>9: 256K bytes<br>10: 512K bytes<br>11: 1M bytes<br>12: 2M bytes<br>13: 4M bytes<br>14: 8M bytes<br>15: 16M bytes<br>16: 32M bytes<br>17: 64M bytes<br>18: 128M bytes<br>19: 256M bytes<br>20: 512M bytes<br>21: 1G bytes<br>22: 2G bytes<br>23: 4G bytes<br>others: reserved" },
          { bits: "0", name: "mem_regionx", type: "RO", description: "0: don't support mem_regionx<br>1: support mem_regionx" }
        ]
      },
      {
        name: "mem_region0_cfg_hi",
        description: "Hardware memory-region0 information (higher 32 bits).",
        permission: "MRO",
        offset: "0x0058",
        fields: [
          { bits: "31:0", name: "mem_regionx_base_hi", type: "RO", description: "mem_regionx's high 32 bits base address" }
        ]
      },
      {
        name: "mem_region1_cfg_lo",
        description: "Hardware memory-region1 information (lower 32 bits).",
        permission: "MRW",
        offset: "0x005C",
        fields: [
          { bits: "31:10", name: "mem_regionx_base_lo", type: "RO", description: "mem_regionx's low 32 bits base address(aligned 1k)" },
          { bits: "9", name: "mem_regionx_ena", type: "RW", description: "0: disable<br>1: enable" },
          { bits: "8:6", name: "Reserved", type: "RO", description: "reserved" },
          { bits: "5:1", name: "mem_regionx_size", type: "RO", description: "0: 0 bytes<br>1: 1K bytes<br>2: 2K bytes<br>3: 4K bytes<br>4: 8K bytes<br>5: 16K bytes<br>6: 32K bytes<br>7: 64K bytes<br>8: 128K bytes<br>9: 256K bytes<br>10: 512K bytes<br>11: 1M bytes<br>12: 2M bytes<br>13: 4M bytes<br>14: 8M bytes<br>15: 16M bytes<br>16: 32M bytes<br>17: 64M bytes<br>18: 128M bytes<br>19: 256M bytes<br>20: 512M bytes<br>21: 1G bytes<br>22: 2G bytes<br>23: 4G bytes<br>others: reserved" },
          { bits: "0", name: "mem_regionx", type: "RO", description: "0: don't support mem_regionx<br>1: support mem_regionx" }
        ]
      },
      {
        name: "mem_region1_cfg_hi",
        description: "Hardware memory-region1 information (higher 32 bits).",
        permission: "MRO",
        offset: "0x0060",
        fields: [
          { bits: "31:0", name: "mem_regionx_base_hi", type: "RO", description: "mem_regionx's high 32 bits base address" }
        ]
      },
      {
        name: "isa_support0",
        description: "Shows the hardware support RISC-V ISA (part 0).",
        permission: "MRO",
        offset: "0x0070",
        fields: [
          { bits: "31:30", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "29", name: "Zawrs", type: "RO", description: "Zawrs extension support." },
          { bits: "28", name: "Zicntr", type: "RO", description: "Zicntr extension support." },
          { bits: "27", name: "Smcntrpmf", type: "RO", description: "Smcntrpmf extension support." },
          { bits: "26", name: "Zihpm", type: "RO", description: "Zihpm extension support." },
          { bits: "25", name: "Smrnmi", type: "RO", description: "Smrnmi extension support." },
          { bits: "24", name: "Zvfhmin", type: "RO", description: "Zvfhmin extension support." },
          { bits: "23", name: "Zvfh", type: "RO", description: "Zvfh extension support." },
          { bits: "22", name: "Zihintpause", type: "RO", description: "Zihintpause extension support." },
          { bits: "21", name: "Zihintntl", type: "RO", description: "Zihintntl extension support." },
          { bits: "20", name: "Zicond", type: "RO", description: "Zicond extension support." },
          { bits: "19", name: "Zcmop", type: "RO", description: "Zcmop extension support." },
          { bits: "18", name: "Zimop", type: "RO", description: "Zimop extension support." },
          { bits: "17", name: "Zve64d", type: "RO", description: "Zve64d extension support." },
          { bits: "16", name: "Zve64f", type: "RO", description: "Zve64f extension support." },
          { bits: "15", name: "Zve64x", type: "RO", description: "Zve64x extension support." },
          { bits: "14", name: "Zve32f", type: "RO", description: "Zve32f extension support." },
          { bits: "13", name: "Zve32x", type: "RO", description: "Zve32x extension support." },
          { bits: "12", name: "Bf16", type: "RO", description: "Bf16 extension support." },
          { bits: "11", name: "Svinval", type: "RO", description: "Svinval extension support." },
          { bits: "10", name: "Svpbmt", type: "RO", description: "Svpbmt extension support." },
          { bits: "9", name: "Svnapot", type: "RO", description: "Svnapot extension support." },
          { bits: "8", name: "Zfa", type: "RO", description: "Zfa extension support." },
          { bits: "7", name: "Zfhmin", type: "RO", description: "Zfhmin extension support." },
          { bits: "6", name: "Zfh", type: "RO", description: "Zfh extension support." },
          { bits: "5", name: "Sscofpmf", type: "RO", description: "Sscofpmf extension support." },
          { bits: "4", name: "Smepmp", type: "RO", description: "Smepmp extension support." },
          { bits: "3", name: "Vector-K", type: "RO", description: "Vector-K extension support." },
          { bits: "2", name: "Vector-B", type: "RO", description: "Vector-B extension support." },
          { bits: "1", name: "Vector", type: "RO", description: "Vector extension support." },
          { bits: "0", name: "EXIST", type: "RO", description: "This register exist.<br>1: This register exist<br>0: This register it not exist" }
        ]
      },
      {
        name: "isa_support1",
        description: "Shows the hardware support RISC-V ISA (part 1).",
        permission: "MRO",
        offset: "0x0074",
        fields: [
          { bits: "31:25", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "24", name: "zbc", type: "RO", description: "zbc extension support." },
          { bits: "23", name: "zba_zbb_zbs", type: "RO", description: "zba_zbb_zbs extension support." },
          { bits: "22", name: "zhinx", type: "RO", description: "zhinx extension support." },
          { bits: "21", name: "zdinx", type: "RO", description: "zdinx extension support." },
          { bits: "20", name: "zfinx", type: "RO", description: "zfinx extension support." },
          { bits: "19", name: "zibi", type: "RO", description: "extension support for branch with immediate." },
          { bits: "18", name: "RVA23", type: "RO", description: "RVA23 extension support." },
          { bits: "17", name: "Svadu", type: "RO", description: "Svadu extension support." },
          { bits: "16", name: "Sscsrind", type: "RO", description: "Sscsrind extension support." },
          { bits: "15", name: "Smcsrind", type: "RO", description: "Smcsrind extension support." },
          { bits: "14", name: "Sstateen", type: "RO", description: "Sstateen extension support." },
          { bits: "13", name: "Smstateen", type: "RO", description: "Smstateen extension support." },
          { bits: "12", name: "Ssnpm", type: "RO", description: "Ssnpm extension support." },
          { bits: "11", name: "Smnpm", type: "RO", description: "Smnpm extension support." },
          { bits: "10", name: "Smmpm", type: "RO", description: "Smmpm extension support." },
          { bits: "9", name: "Smcdeleg", type: "RO", description: "Smcdeleg extension support." },
          { bits: "8", name: "Ssdbltrp", type: "RO", description: "Ssdbltrp extension support." },
          { bits: "7", name: "Smdbltrp", type: "RO", description: "Smdbltrp extension support." },
          { bits: "6", name: "Zabha", type: "RO", description: "Zabha extension support." },
          { bits: "5", name: "Zacas", type: "RO", description: "Zacas extension support." },
          { bits: "4", name: "Smctr", type: "RO", description: "Smctr extension support." },
          { bits: "3", name: "Zicfiss", type: "RO", description: "Zicfiss extension support." },
          { bits: "2", name: "Zicflip", type: "RO", description: "Zicflip extension support." },
          { bits: "1", name: "Ssqosid", type: "RO", description: "Ssqosid extension support." },
          { bits: "0", name: "Active", type: "RO", description: "This register active.<br>1: This register active<br>0: This register it not active" }
        ]
      },
      {
        name: "mcppi_cfg_lo",
        description: "Shows the CPPI configurations information (lower 32 bits).",
        permission: "MRW",
        offset: "0x0080",
        fields: [
          { bits: "31:10", name: "cppi_base_lo", type: "RO", description: "CPPI base address [31:10]" },
          { bits: "9", name: "cppi_ena", type: "RW", description: "Enable CPPI or not, default is 1 (enable)." },
          { bits: "8:6", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "5:1", name: "cppi_size", type: "RO", description: "0: 0 bytes<br>1: 1K bytes<br>2: 2K bytes<br>3: 4K bytes<br>4: 8K bytes<br>5: 16K bytes<br>6: 32K bytes<br>7: 64K bytes<br>8: 128K bytes<br>9: 256K bytes<br>10: 512K bytes<br>11: 1M bytes<br>12: 2M bytes<br>13: 4M bytes<br>14: 8M bytes<br>15: 16M bytes<br>16: 32M bytes<br>17: 64M bytes<br>18: 128M bytes<br>19: 256M bytes<br>20: 512M bytes<br>21: 1G bytes<br>22: 2G bytes<br>23: 4G bytes<br>others: reserved" },
          { bits: "0", name: "cppi", type: "RO", description: "Shows the hardware has CPPI configuration or not. 0 means no, 1 means yes." }
        ]
      },
      {
        name: "mcppi_cfg_hi",
        description: "Shows the higher 32 bit of CPPI base address.",
        permission: "MR",
        offset: "0x0084",
        fields: [
          { bits: "31:0", name: "cppi_base_hi", type: "RO", description: "Higher 32 bit of CPPI base address" }
        ]
      },
      {
        name: "mpftctl",
        description: "Controls the configuration of the power brake feature (slow mode) in Low Power Mode.",
        permission: "MRW",
        offset: "0x0088",
        fields: [
          { bits: "31:5", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "4", name: "mpfena", type: "RW", description: "turn on the power brake when set, and off when clear." },
          { bits: "3:0", name: "mpflvl", type: "RW", description: "set the duration of power brake." }
        ]
      },
      {
        name: "performance_cfg0",
        description: "Shows the hardware information about performance (part 0).",
        permission: "MRO",
        offset: "0x0090",
        fields: [
          { bits: "31", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "30:28", name: "MUL_CYC", type: "RO", description: "Multiplier cycle. If 0, not support multiplier" },
          { bits: "27:23", name: "DCACHE_LBUF_NUM", type: "RO", description: "Dcache line buffer number. If 0, not support Dcache" },
          { bits: "22", name: "DCACHE_PREFETCH", type: "RO", description: "Dcache prefetch has config. 1: Has config, 0: Not has config" },
          { bits: "21", name: "MEM_CUT_TIMING", type: "RO", description: "MEM cut timing has config. 1: Has config, 0: Not has config" },
          { bits: "20", name: "IFU_CUT_TIMING", type: "RO", description: "IFU cut timing has config. 1: Has config, 0: Not has config" },
          { bits: "19:16", name: "DSP_CYCLE", type: "RO", description: "DSP cycle. If 0, not support DSP." },
          { bits: "15", name: "LSU_CUT_FWD", type: "RO", description: "LSU cut forwarding has config. 1: Has config, 0: Not has config" },
          { bits: "14", name: "DLM_TWO_STAGE", type: "RO", description: "DLM two stage has config. 1: Has config, 0: Not has config" },
          { bits: "13", name: "CROSS_4K", type: "RO", description: "Cross 4K has config. 1: Has config, 0: Not has config" },
          { bits: "12", name: "DUAL_ISSUE", type: "RO", description: "Dual Issue has config. 1: Has config, 0: Not has config" },
          { bits: "11:9", name: "BUS_TYPE", type: "RO", description: "The memory bus protocol type. 0: ICB BUS, 1: AXI BUS, 2: AHBL BUS" },
          { bits: "8", name: "DELAY_BRANCH_FLUSH", type: "RO", description: "Delay branch flush has config. 1: Has config, 0: Not Has config" },
          { bits: "7", name: "DCACHE_TWO_STAGE", type: "RO", description: "Dcache two stage has config. 1: Has config, 0: Not Has config" },
          { bits: "6", name: "HIGH_DIV", type: "RO", description: "High Performance Divider Support. 1: Support, 0: Not support" },
          { bits: "5:1", name: "FPU_CYCLE", type: "RO", description: "FPU cycle count. If 0, not support FPU." },
          { bits: "0", name: "EXIST", type: "RO", description: "This register exist. 1: This register exist, 0: This register it not exist" }
        ]
      },
      {
        name: "performance_cfg1",
        description: "Shows the hardware information about performance (part 1).",
        permission: "MRO",
        offset: "0x0094",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "15:14", name: "HPM_VER", type: "RO", description: "Hardware performance monitor version. 2: Version 2, 1: Version 1, 0: Not support" },
          { bits: "13", name: "CAU_FORWARD", type: "RO", description: "Crypto instruction forward has config. 1: Has config, 0: Not Has config" },
          { bits: "12", name: "AGU_QUICK_FORWARD", type: "RO", description: "Agu quick forward has config. 1: Has config, 0: Not Has config" },
          { bits: "11", name: "HIGH_PERFORMANCE", type: "RO", description: "High performance has config. 1: Has config, 0: Not Has config" },
          { bits: "10:6", name: "BHT_ENTRY_WIDTH", type: "RO", description: "BHT entry width config. The value is CFG_BHT_ENTRY_WIDTH-9" },
          { bits: "5:1", name: "VFPU_CYC", type: "RO", description: "Vector FPU cycle count. If 0, not support Vector FPU." },
          { bits: "0", name: "EXIST", type: "RO", description: "This register exist. 1: This register exist, 0: This register it not exist" }
        ]
      },
      {
        name: "pfl1dctrl1",
        description: "Controls L1 D-Cache prefetch functions.",
        permission: "S*RW",
        offset: "0x0100",
        fields: [
          { bits: "31:15", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "14:12", name: "pref_conflict_decr_sel", type: "RW", description: "decrease the conflict counter when a number of prefetch is sent. This field select how the number of prefetch:<br>0: disable<br>1: 1024 prefetches<br>2: 512 prefetches<br>3: 256<br>4: 128<br>5: 64<br>6: 32<br>7: 16" },
          { bits: "11:8", name: "pref_conflict_stop_th", type: "RW", description: "when prefetch has Dcache hit, a counter is increased. When the counter is greater than this threshold, the prefetch is stopped" },
          { bits: "7", name: "pl2_enable", type: "RW", description: "Enable PL2 prefetching. 0: Disable, 1: Enable" },
          { bits: "6", name: "pref_mmu_next_cacheline", type: "RW", description: "When a table walk access for a miss occurs in the MMU, prefetch the next cacheline that is incremented. 0: Disable, 1: Enable" },
          { bits: "5", name: "cross_page_pref_ena", type: "RW", description: "Prefetch cross page enable. 0: Disable, 1: Enable" },
          { bits: "4", name: "write_pref_ena", type: "RW", description: "Store prefetch enable. 0: Disable, 1: Enable" },
          { bits: "3", name: "vector_ena", type: "RW", description: "Vector pipeline prefetch enable. 0: Disable, 1: Enable" },
          { bits: "2", name: "scalar_ena", type: "RW", description: "Scalar pipeline prefetch enable. 0: Disable, 1: Enable" },
          { bits: "1", name: "cc_ena", type: "RW", description: "Cluster Cache prefetch enable. 0: Disable, 1: Enable" },
          { bits: "0", name: "l1d_ena", type: "RW", description: "L1 D-Cache prefetch enable. 0: Disable, 1: Enable" }
        ]
      },
      {
        name: "pfl1dctrl2",
        description: "Controls prefetch degree and write streaming thresholds.",
        permission: "S*RW",
        offset: "0x0104",
        fields: [
          { bits: "31:20", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "19:18", name: "write_no-allocate_L2_threshold", type: "RW", description: "Write streaming no-L2-allocate threshold. The possible values are:<br>0b00 16th consecutive streaming cache line does not allocate in the L2 cache. This is the reset value.<br>0b01 128th consecutive streaming cache line does not allocate in the L2 cache.<br>0b10 512th consecutive streaming cache line does not allocate in the L2 cache.<br>0b11 Disables streaming. All write-allocate lines allocate in the L2 cache." },
          { bits: "17:16", name: "write_no-allocate_L1_threshold", type: "RW", description: "Write streaming no-L1-allocate threshold. The possible values are:<br>0b00 4th consecutive streaming cache line does not allocate in the L1 cache. This is the reset value.<br>0b01 64th consecutive streaming cache line does not allocate in the L1 cache.<br>0b10 128th consecutive streaming cache line does not allocate in the L1 cache.<br>0b11 Disables streaming. All write-allocate lines allocate in the L1 cache." },
          { bits: "15:12", name: "next_line_ena_threshold", type: "RW", description: "Threshold of enabling next-line mode prefetch. The next line prefetch mode is enabled when the proportion of Dcache miss commands to all commands is less than threshold/16." },
          { bits: "11:6", name: "degree_decr_threshold", type: "RW", description: "Prefetch degree threshold of decreasing. When the accuracy of a certain prefetch is less than the threshold, the prefetch degree is decreased." },
          { bits: "5:0", name: "degree_incr_threshold", type: "RW", description: "Prefetch degree threshold of increasing. When the accuracy of a certain prefetch is greater than the threshold, the prefetch degree is increased." }
        ]
      },
      {
        name: "mergel1dctrl",
        description: "Controls write streaming and non-cacheable merge related features.",
        permission: "S*RW",
        offset: "0x0108",
        fields: [
          { bits: "31:25", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "24", name: "dev_nc_store_early_ret", type: "RW", description: "It is to control the core to treat the device and non-cacheable region store is non-blocking (earlier return) or blocking.<br>1: device and non-cacheable region store is non-blocking.<br>0: device and non-cacheable region store is blocking." },
          { bits: "23:16", name: "nc_tmout_max", type: "RW", description: "Non-cacheable Merge Buffer timer out counter max value. The number indicate how many cycles core will wait to merge the Non-Cacheable Merge Buffer. If this value is non-zero, it supports the early response of non-cacheable region." },
          { bits: "15:12", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "11:0", name: "ws_tmout_max", type: "RW", description: "Write Streaming Merge Buffer timer out counter max value. The number indicate how many cycles core will wait to merge the Write Streaming Buffer." }
        ]
      },
      {
        name: "safety_ctrl",
        description: "Controls safety features.",
        permission: "MRW",
        offset: "0x0110",
        fields: [
          { bits: "31:2", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "1:0", name: "REG_PROT_CHCK_EN", type: "RW", description: "Register protect check enable.<br>* 2'b01: Disable (Default)<br>* 2'b10: Enable<br>If value is 2'b00 or 2'b11, the error will on output reg_prot_err_pulse." }
        ]
      },
      {
        name: "access_ctrl",
        description: "Controls IINFO registers can be accessed in S-mode.",
        permission: "MRW",
        offset: "0x0114",
        fields: [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "pma_csr_access", type: "RW", description: "Control access permission of mattribute CSR in S-mode. 0: Disable S-mode access, 1: Enable S-mode access" },
          { bits: "2", name: "cache_csr_access", type: "RW", description: "Control access permission of cache_ctrl CSR in S-mode. 0: Disable S-mode access, 1: Enable S-mode access" },
          { bits: "1", name: "pf_access", type: "RW", description: "S-mode can access prefetch/write streaming/merge related registers. 0: Enable(Default), 1: Disable. Currently this bit controls 5 registers: pfl1dctrl1, pfl1dctrl2, pfl1dctrl3, pfl1dctrl4, mergel1dctrl" },
          { bits: "0", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "pfl1dctrl3",
        description: "Controls Cluster Cache prefetch functions.",
        permission: "S*RW",
        offset: "0x0120",
        fields: [
          { bits: "31:28", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "27:21", name: "max_stride/cplx_l2_degree", type: "RW", description: "The max stride/cplx prefetch L2 degree." },
          { bits: "20", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "19:16", name: "max_stride_cplx_l1_degree", type: "RW", description: "The max stride/cplx prefetch L1 degree." },
          { bits: "15:12", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "11:5", name: "max_stream_l2_degree", type: "RW", description: "The max stream prefetch l2 degree." },
          { bits: "4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3:0", name: "max_stream_l1_degree", type: "RW", description: "The max stream prefetch L1 degree." }
        ]
      },
      {
        name: "pfl1dctrl4",
        description: "Controls Cache prefetch overall enable.",
        permission: "S*RW",
        offset: "0x0124",
        fields: [
          { bits: "31:2", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "1", name: "cc_short enable", type: "RW", description: "Cc_short enable. 0: Disable cc_short, 1: Enable cc_short(Reduce the latency of L2 cache hit)" },
          { bits: "0", name: "pf_enable", type: "RW", description: "The prefetch overall enable. 0: Disable prefetch, 1: Enable prefetch" }
        ]
      },
      {
        name: "pfl1info",
        description: "Shows prefetch feature information.",
        permission: "MRO",
        offset: "0x0128",
        fields: [
          { bits: "31:24", name: "pf_ver", type: "RO", description: "Prefetch Version" },
          { bits: "23:16", name: "l2_pf_dbuf_num", type: "RO", description: "L2 prefetch data buffer number" },
          { bits: "15:8", name: "l2_pf_lbuf_num", type: "RO", description: "L2 prefetch request address buffer number" },
          { bits: "7:0", name: "pf_cfg", type: "RO", description: "0: No Hardware Prefetch<br>1: Normal Hardware Prefetch<br>2: High Performance Hardware Prefetch<br>Other: Reserved" }
        ]
      },
      {
        name: "crc_rf0",
        description: "Register x22 CRC value.",
        permission: "MRW",
        offset: "0x0198",
        fields: [
          { bits: "31:0", name: "crc", type: "RW", description: "The x22 register CRC value." }
        ]
      },
      {
        name: "crc_rf1",
        description: "Register x23 CRC value.",
        permission: "MRW",
        offset: "0x019C",
        fields: [
          { bits: "31:0", name: "crc", type: "RW", description: "The x23 register CRC value." }
        ]
      },
      {
        name: "crc_fp0",
        description: "Register f23 CRC value.",
        permission: "MRW",
        offset: "0x01a0",
        fields: [
          { bits: "31:0", name: "crc", type: "RW", description: "The f23 register CRC value." }
        ]
      },
      {
        name: "etrace_info",
        description: "Provides the relevant configuration information for etrace.",
        permission: "MRO",
        offset: "0x01a4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "15", name: "data_trace", type: "RO", description: "rtl support the feature of data trace. 0: not support the feature of data trace, 1: support the feature of data trace" },
          { bits: "14:9", name: "Reserved", type: "RO", description: "reserved for support version" },
          { bits: "8:1", name: "support version", type: "RO", description: "if the cpu supports the etrace feature, this value is 0x20, indicating support the standard of 2.0 version etrace, if the cpu don't support the etrace feature, this value is 0x0" },
          { bits: "0", name: "exist", type: "RO", description: "rtl support the feature of etrace. 0: not support the feature of etrace, 1: support the feature of etrace" }
        ]
      },
      {
        name: "ecc_inj_addr_lo",
        description: "Low 32-bit address of Precise ECC inject.",
        permission: "MRW",
        offset: "0x01a8",
        fields: [
          { bits: "31:0", name: "ecc_inj_addr_lo", type: "RW", description: "The low 32-bit address of Precise ECC inject" }
        ]
      },
      {
        name: "ecc_inj_addr_hi",
        description: "High 32-bit address of Precise ECC inject.",
        permission: "MRW",
        offset: "0x01ac",
        fields: [
          { bits: "31:0", name: "ecc_inj_addr_hi", type: "RW", description: "The high 32-bit address of Precise ECC inject" }
        ]
      },
      {
        name: "ecc_inj_way",
        description: "Indicates the Precise ECC inject way.",
        permission: "MRW",
        offset: "0x01B0",
        fields: [
          { bits: "31", name: "precise ecc inject", type: "RO", description: "rtl support the feature of precise ecc inject. 0: not support the feature of precise ecc inject, 1: support the feature of precise ecc inject" },
          { bits: "30", name: "security mode", type: "RW", description: "Indicate the current security mode. 0: sec mode, 1: non-sec mode" },
          { bits: "29:8", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "7:0", name: "inject_way", type: "RW", description: "A bit set to 1 in this field indicates the corresponding way by precise ecc inject. Note: It must be One-Hot Encoding here." }
        ]
      },
      {
        name: "mem_crc_x22_lo",
        description: "Write value to this reg lower word to calculate CRC for crc x22.",
        permission: "SRW",
        offset: "0x0300",
        fields: [
          { bits: "31:0", name: "mem_crc_x22_lo", type: "RW", description: "Write value to this reg lower word to calculate CRC for crc x22." }
        ]
      },
      {
        name: "mem_crc_x22_hi",
        description: "Write value to this reg higher word to calculate CRC for crc x22.",
        permission: "SRW",
        offset: "0x0304",
        fields: [
          { bits: "31:0", name: "mem_crc_x22_hi", type: "RW", description: "Write value to this reg higher word to calculate CRC for crc x22." }
        ]
      },
      {
        name: "mem_crc_x23_lo",
        description: "Write value to this reg lower word to calculate CRC for crc x23.",
        permission: "SRW",
        offset: "0x0308",
        fields: [
          { bits: "31:0", name: "mem_crc_x23_lo", type: "RW", description: "Write value to this reg lower word to calculate CRC for crc x23." }
        ]
      },
      {
        name: "mem_crc_x23_hi",
        description: "Write value to this reg higher word to calculate CRC for crc x23.",
        permission: "SRW",
        offset: "0x030c",
        fields: [
          { bits: "31:0", name: "mem_crc_x23_hi", type: "RW", description: "Write value to this reg higher word to calculate CRC for crc x23." }
        ]
      },
      {
        name: "mem_crc_f23_lo",
        description: "Write value to this reg lower word to calculate CRC for crc f23.",
        permission: "SRW",
        offset: "0x0310",
        fields: [
          { bits: "31:0", name: "mem_crc_f23_lo", type: "RW", description: "Write value to this reg lower word to calculate CRC for crc f23." }
        ]
      },
      {
        name: "mem_crc_f23_hi",
        description: "Write value to this reg higher word to calculate CRC for crc f23.",
        permission: "SRW",
        offset: "0x0314",
        fields: [
          { bits: "31:0", name: "mem_crc_f23_hi", type: "RW", description: "Write value to this reg higher word to calculate CRC for crc f23." }
        ]
      }
    ]
  },
  {
    unit: "debug",
    offset: "0x10000",
    size: "64KB",
    description: "Address space of DEBUG unit.",
    regs: []
  },
  {
    unit: "eclic",
    offset: "0x20000",
    size: "64KB",
    description: "Enhanced Core Local Interrupt Controller (ECLIC) for fast interrupt handling.",
    regs: [
      {
        name: "cliccfg",
        description: "Global configuration register for ECLIC.",
        permission: "MRW",
        offset: "0x0000",
        fields: [
          { bits: "7:7", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "6:5", name: "nmbits", type: "RO", description: "Ties to 1, indicates supervisor-level interrupt support." },
          { bits: "4:1", name: "nlbits", type: "RW", description: "Specifies the bit-width of level and priority in clicintctl[i]." },
          { bits: "0:0", name: "Reserved", type: "RO", description: "Reserved, ties to 1." }
        ]
      },
      {
        name: "clicinfo",
        description: "Global information register for ECLIC.",
        permission: "RO",
        offset: "0x0004",
        fields: [
          { bits: "31:29", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "28:25", name: "SHD_NUM", type: "RO", description: "Shadow register group number for each privilege mode." },
          { bits: "24:21", name: "CLICINTCTLBITS", type: "RO", description: "Effective bit-width of clicintctl[i]." },
          { bits: "20:13", name: "VERSION", type: "RO", description: "Hardware implementation version number." },
          { bits: "12:0", name: "NUM_INTERRUPT", type: "RO", description: "Number of interrupt sources supported." }
        ]
      },
      {
        name: "mintthresh",
        description: "Interrupt threshold level register for M-mode and S-mode.",
        permission: "MRW",
        offset: "0x0008",
        fields: [
          { bits: "31:24", name: "mth", type: "RW", description: "Interrupt-level threshold for M-mode." },
          { bits: "23:16", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "15:8", name: "sth", type: "RW", description: "Interrupt-level threshold for S-mode." },
          { bits: "7:0", name: "Reserved", type: "RO", description: "Reserved, ties to 0." }
        ]
      },
      {
        name: "clicintip[i]",
        description: "M-mode interrupt pending flag register for interrupt source i.",
        permission: "MRW",
        offset: "0x1000+4*i",
        fields: [
          { bits: "7:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "0:0", name: "IP", type: "RW", description: "Interrupt source pending flag." }
        ]
      },
      {
        name: "clicintie[i]",
        description: "M-mode interrupt enable register for interrupt source i.",
        permission: "MRW",
        offset: "0x1001+4*i",
        fields: [
          { bits: "7:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "0:0", name: "IE", type: "RW", description: "Interrupt enable bit." }
        ]
      },
      {
        name: "clicintattr[i]",
        description: "M-mode interrupt attribute register for interrupt source i.",
        permission: "MRW",
        offset: "0x1002+4*i",
        fields: [
          { bits: "7:6", name: "mode", type: "RW", description: "Privilege mode to take interrupt: 3=M-mode, 1=S-mode. Only 1 or 3 can be written, other values ignored." },
          { bits: "5:3", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "2:1", name: "trig", type: "RW", description: "Trigger type: 0=level, 1=rising edge, 3=falling edge." },
          { bits: "0:0", name: "shv", type: "RW", description: "Vectored mode: 1=vectored, 0=non-vectored." }
        ]
      },
      {
        name: "clicintctl[i]",
        description: "M-mode interrupt control register for interrupt source i. Used to set the level and priority.",
        permission: "MRW",
        offset: "0x1003+4*i",
        fields: [
          { bits: "7:CLICINTCTLBITS", name: "reserved", type: "RO", description: "Reserved, reads as 0. CLICINTCTLBITS is 3 for calculation." },
          { bits: "(CLICINTCTLBITS-1):(CLICINTCTLBITS-nlbits)", name: "level", type: "RW", description: "Interrupt level. Higher value = higher priority, can preempt lower level interrupts. nlbits 1 is for calculation." },
          { bits: "(CLICINTCTLBITS-nlbits-1):0", name: "priority", type: "RW", description: "Interrupt priority within the same level. Higher value = higher priority. Unimplemented low bits are tied to 1. nlbits 1 is for calculation." }
        ]
      },
      {
        name: "sintthresh",
        description: "Interrupt threshold level register for S-mode. Mirror of mintthresh.sth.",
        permission: "SRW",
        offset: "0x2008",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "15:8", name: "sth", type: "RW", description: "Interrupt-level threshold for S-mode. Mirror of mintthresh.sth." },
          { bits: "7:0", name: "Reserved", type: "RO", description: "Reserved, ties to 0." }
        ]
      },
      {
        name: "clicintip_s[i]",
        description: "S-mode interrupt pending flag register for interrupt source i. Only accessible for interrupts configured with mode=1.",
        permission: "SRW",
        offset: "0x3000+4*i",
        fields: [
          { bits: "7:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "0:0", name: "IP", type: "RW", description: "Interrupt source pending flag." }
        ]
      },
      {
        name: "clicintie_s[i]",
        description: "S-mode interrupt enable register for interrupt source i. Only accessible for interrupts configured with mode=1.",
        permission: "SRW",
        offset: "0x3001+4*i",
        fields: [
          { bits: "7:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "0:0", name: "IE", type: "RW", description: "Interrupt enable bit." }
        ]
      },
      {
        name: "clicintattr_s[i]",
        description: "S-mode interrupt attribute register for interrupt source i. Only accessible for interrupts configured with mode=1.",
        permission: "SRW",
        offset: "0x3002+4*i",
        fields: [
          { bits: "7:6", name: "mode", type: "RO", description: "Privilege mode (read-only in S-mode)." },
          { bits: "5:3", name: "Reserved", type: "RO", description: "Reserved, ties to 0." },
          { bits: "2:1", name: "trig", type: "RW", description: "Trigger type (only low 6 bits writable in S-mode)." },
          { bits: "0:0", name: "shv", type: "RW", description: "Vectored mode." }
        ]
      },
      {
        name: "clicintctl_s[i]",
        description: "S-mode interrupt control register for interrupt source i. Only accessible for interrupts configured with mode=1.",
        permission: "SRW",
        offset: "0x3003+4*i",
        fields: [
          { bits: "7:CLICINTCTLBITS", name: "reserved", type: "RO", description: "Reserved, reads as 0. CLICINTCTLBITS is 3 for calculation." },
          { bits: "(CLICINTCTLBITS-1):(CLICINTCTLBITS-nlbits)", name: "level", type: "RW", description: "Interrupt level. Higher value = higher priority, can preempt lower level interrupts. nlbits 1 is for calculation." },
          { bits: "(CLICINTCTLBITS-nlbits-1):0", name: "priority", type: "RW", description: "Interrupt priority within the same level. Higher value = higher priority. Unimplemented low bits are tied to 1. nlbits 1 is for calculation." }
        ]
      }
    ]
  },
  {
    unit: "timer",
    offset: "0x30000",
    size: "64KB",
    description: "Address space of TIMER unit. The Timer Unit (TIMER) is used to generate the Timer Interrupt and Software Interrupt in Nuclei Processor Core.",
    regs: [
      {
        name: "mtime_lo",
        description: "Reflect the lower 32-bit value of mtime. Shadow copy of MTIME in CLINT mode.",
        permission: "S*RW",
        offset: "0x0",
        fields: [
          { bits: "31:0", name: "mtime_lo", type: "RW", description: "Lower 32-bit value of mtime." }
        ]
      },
      {
        name: "mtime_hi",
        description: "Reflect the upper 32-bit value of mtime. Shadow copy of MTIME in CLINT mode.",
        permission: "S*RW",
        offset: "0x4",
        fields: [
          { bits: "31:0", name: "mtime_hi", type: "RW", description: "Upper 32-bit value of mtime." }
        ]
      },
      {
        name: "mtimecmp_lo",
        description: "Set the lower 32-bit value of mtimecmp. Shadow copy of MTIMECMP for 1st hart in CLINT mode.",
        permission: "S*RW",
        offset: "0x8",
        fields: [
          { bits: "31:0", name: "mtimecmp_lo", type: "RW", description: "Lower 32-bit value of mtimecmp." }
        ]
      },
      {
        name: "mtimecmp_hi",
        description: "Set the upper 32-bit value of mtimecmp. Shadow copy of MTIMECMP for 1st hart in CLINT mode.",
        permission: "S*RW",
        offset: "0xC",
        fields: [
          { bits: "31:0", name: "mtimecmp_hi", type: "RW", description: "Upper 32-bit value of mtimecmp." }
        ]
      },
      {
        name: "mtime_srw_ctrl",
        description: "Control S-mode can access timer registers or not.",
        permission: "MRW",
        offset: "0xFEC",
        fields: [
          { bits: "31:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0" },
          { bits: "0", name: "SRW", type: "RW", description: "0: S-Mode can read/write timer registers, 1: S-Mode cannot read/write timer registers" }
        ]
      },
      {
        name: "msftrst",
        description: "Generate soft-reset request.",
        permission: "S*RW",
        offset: "0xFF0",
        fields: [
          { bits: "31", name: "MSFTRST", type: "RW", description: "Write 0x80000a5f to generate Soft-Reset Request." },
          { bits: "30:0", name: "Reserved", type: "RO", description: "Reserved, ties to 0" }
        ]
      },
      {
        name: "setssip",
        description: "Generate the S-mode Software Interrupt for the local hart.",
        permission: "SW1C",
        offset: "0xFF4",
        fields: [
          { bits: "31:0", name: "setssip", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt, read returns 0." }
        ]
      },
      {
        name: "mtimectl",
        description: "Control the behaviors of timer counting.",
        permission: "S*RW",
        offset: "0xFF8",
        fields: [
          { bits: "31:5", name: "Reserved", type: "RO", description: "Reserved, ties to 0" },
          { bits: "4", name: "MTIME_SRC", type: "RW", description: "MTIME source select. 0: timer unit mtime, 1: Soc mtime." },
          { bits: "3", name: "HDBG", type: "RW", description: "Halt-on-debug control. When set, stoptime in dcsr halts the timer counter in debug mode." },
          { bits: "2", name: "CLKSRC", type: "RW", description: "1: core_aon_clk, 0: mtime_toggle_a" },
          { bits: "1", name: "CMPCLREN", type: "RW", description: "1: mtime cleared to zero after timer interrupt, 0: mtime increments normally" },
          { bits: "0", name: "TIMESTOP", type: "RW", description: "1: timer paused, 0: timer increments normally" }
        ]
      },
      {
        name: "msip",
        description: "Generate the M-mode Software Interrupt for the local hart.",
        permission: "S*RW",
        offset: "0xFFC",
        fields: [
          { bits: "31:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0" },
          { bits: "0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt, write 0 to clear." }
        ]
      },
      {
        name: "msip0",
        description: "M-mode Software Interrupt for Hart 0.",
        permission: "S*RW",
        offset: "0x1000",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 0, write 0 to clear." }
        ]
      },
      {
        name: "msip1",
        description: "M-mode Software Interrupt for Hart 1.",
        permission: "S*RW",
        offset: "0x1004",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 1, write 0 to clear." }
        ]
      },
      {
        name: "msip2",
        description: "M-mode Software Interrupt for Hart 2.",
        permission: "S*RW",
        offset: "0x1008",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 2, write 0 to clear." }
        ]
      },
      {
        name: "msip3",
        description: "M-mode Software Interrupt for Hart 3.",
        permission: "S*RW",
        offset: "0x100C",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 3, write 0 to clear." }
        ]
      },
      {
        name: "msip4",
        description: "M-mode Software Interrupt for Hart 4.",
        permission: "S*RW",
        offset: "0x1010",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 4, write 0 to clear." }
        ]
      },
      {
        name: "msip5",
        description: "M-mode Software Interrupt for Hart 5.",
        permission: "S*RW",
        offset: "0x1014",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 5, write 0 to clear." }
        ]
      },
      {
        name: "msip6",
        description: "M-mode Software Interrupt for Hart 6.",
        permission: "S*RW",
        offset: "0x1018",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 6, write 0 to clear." }
        ]
      },
      {
        name: "msip7",
        description: "M-mode Software Interrupt for Hart 7.",
        permission: "S*RW",
        offset: "0x101C",
        fields: [
          { bits: "31:0", name: "MSIP", type: "RW", description: "Write 1 to generate M-mode software interrupt for Hart 7, write 0 to clear." }
        ]
      },
      {
        name: "mtimecmp0",
        description: "M-mode timer compare register for Hart 0.",
        permission: "S*RW",
        offset: "0x5000",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 0. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp1",
        description: "M-mode timer compare register for Hart 1.",
        permission: "S*RW",
        offset: "0x5008",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 1. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp2",
        description: "M-mode timer compare register for Hart 2.",
        permission: "S*RW",
        offset: "0x5010",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 2. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp3",
        description: "M-mode timer compare register for Hart 3.",
        permission: "S*RW",
        offset: "0x5018",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 3. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp4",
        description: "M-mode timer compare register for Hart 4.",
        permission: "S*RW",
        offset: "0x5020",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 4. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp5",
        description: "M-mode timer compare register for Hart 5.",
        permission: "S*RW",
        offset: "0x5028",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 5. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp6",
        description: "M-mode timer compare register for Hart 6.",
        permission: "S*RW",
        offset: "0x5030",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 6. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtimecmp7",
        description: "M-mode timer compare register for Hart 7.",
        permission: "S*RW",
        offset: "0x5038",
        fields: [
          { bits: "63:0", name: "mtimecmp", type: "RW", description: "Timer compare value for Hart 7. When mtime >= mtimecmp, timer interrupt is generated." }
        ]
      },
      {
        name: "mtime",
        description: "MTIME register in CLINT mode.",
        permission: "S*RW",
        offset: "0xCFF8",
        fields: [
          { bits: "63:0", name: "mtime", type: "RW", description: "64-bit timer counter value." }
        ]
      },
      {
        name: "setssip0",
        description: "Set Supervisor Software Interrupt request for Hart 0.",
        permission: "SW1C",
        offset: "0xD000",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 0, read returns 0." }
        ]
      },
      {
        name: "setssip1",
        description: "Set Supervisor Software Interrupt request for Hart 1.",
        permission: "SW1C",
        offset: "0xD004",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 1, read returns 0." }
        ]
      },
      {
        name: "setssip2",
        description: "Set Supervisor Software Interrupt request for Hart 2.",
        permission: "SW1C",
        offset: "0xD008",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 2, read returns 0." }
        ]
      },
      {
        name: "setssip3",
        description: "Set Supervisor Software Interrupt request for Hart 3.",
        permission: "SW1C",
        offset: "0xD00C",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 3, read returns 0." }
        ]
      },
      {
        name: "setssip4",
        description: "Set Supervisor Software Interrupt request for Hart 4.",
        permission: "SW1C",
        offset: "0xD010",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 4, read returns 0." }
        ]
      },
      {
        name: "setssip5",
        description: "Set Supervisor Software Interrupt request for Hart 5.",
        permission: "SW1C",
        offset: "0xD014",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 5, read returns 0." }
        ]
      },
      {
        name: "setssip6",
        description: "Set Supervisor Software Interrupt request for Hart 6.",
        permission: "SW1C",
        offset: "0xD018",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 6, read returns 0." }
        ]
      },
      {
        name: "setssip7",
        description: "Set Supervisor Software Interrupt request for Hart 7.",
        permission: "SW1C",
        offset: "0xD01C",
        fields: [
          { bits: "31:0", name: "SETSSIP", type: "W1C", description: "Write 1 to trigger edge Supervisor Software Interrupt for Hart 7, read returns 0." }
        ]
      }
    ]
  },
  {
    unit: "smp",
    offset: "0x40000",
    size: "64KB",
    description: "Address space of SMP and Cluster Cache. Nuclei Processor Core can optionally support Cluster Cache (CC) and Symmetric Multi-Processor (SMP).",
    regs: [
      {
        name: "SMP_VER",
        description: "Machine Mode SMP Version Register. Shows the microarchitecture implementation version of SMP related module.",
        permission: "MR",
        offset: "0x0",
        fields: [
          { bits: "7:0", name: "Mic_Ver", type: "RO", description: "Micro Version Number" },
          { bits: "15:8", name: "Min_Ver", type: "RO", description: "Minor Version Number" },
          { bits: "23:16", name: "Maj_Ver", type: "RO", description: "Major Version Number" },
          { bits: "31:24", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "SMP_CFG",
        description: "Machine Mode SMP Configuration Register. Shows the hardware configuration of SMP related design.",
        permission: "MR",
        offset: "0x4",
        fields: [
          { bits: "0", name: "CC_PRESENT", type: "RO", description: "Cluster Cache present or not. 0: not present; 1: Present" },
          { bits: "6:1", name: "SMP_CORE_NUM", type: "RO", description: "Indicate core number in the cluster, it is fixed value (smp_core_num -1) when the RTL is generated." },
          { bits: "12:7", name: "IOCP_NUM", type: "RO", description: "The IO Coherency port number in the cluster, it is fixed value when the RTL is generated." },
          { bits: "18:13", name: "PMON_NUM", type: "RO", description: "The performance monitor number, it is fixed value when the RTL is generated." },
          { bits: "31:19", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_CFG",
        description: "Machine Mode CC Config Register. Shows the hardware configuration of Cluster Cache.",
        permission: "MR",
        offset: "0x8",
        fields: [
          { bits: "3:0", name: "CC_SET", type: "RO", description: "Cluster Cache Set Number = 2^(CC_SET)" },
          { bits: "7:4", name: "CC_WAY", type: "RO", description: "Cluster Cache Way Number = (CC_WAY + 1)" },
          { bits: "10:8", name: "CC_LSIZE", type: "RO", description: "Cluster Cache Line Size = 2^(CC_LSIZE + 2)" },
          { bits: "11", name: "CC_ECC", type: "RO", description: "Indicate the Cluster Cache supports ECC or not" },
          { bits: "14:12", name: "CC_TCYCLE", type: "RO", description: "Indicate the L2 Tag sram access cycle - 1. 0: 1-cycle, 1: 2-cycle" },
          { bits: "17:15", name: "CC_DCYCLE", type: "RO", description: "Indicate the L2 Data sram access cycle - 1. 0: 1-cycle, 1: 2-cycle" },
          { bits: "31:18", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "SMP_ENB",
        description: "Machine Mode SMP Enable Register. Controls which cores or all IOCP in the cluster can be cache coherency with each other handled by hardware.",
        permission: "MRW",
        offset: "0xC",
        fields: [
          { bits: "15:0", name: "SMP Enable", type: "RW", description: "SMP Enable Bit for clients in the Cluster. Each bit control one client. The low bit is CORE clients, high bit is IOCP clients." },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_CTRL",
        description: "Machine Mode CC Control Register. Controls Cluster Cache specific functions and gets some status.",
        permission: "MRW",
        offset: "0x10",
        fields: [
          { bits: "0", name: "CC_EN", type: "RW", description: "CC Enable Bit. 0: Disable, 1: Enable" },
          { bits: "1", name: "CC_ECC_EN", type: "RW", description: "CC ECC Enable Bit. 0: Disable, 1: Enable" },
          { bits: "2", name: "ECC_EXCP_EN", type: "RW", description: "CC ECC Exception Enable Bit. 0: Disable, 1: Enable" },
          { bits: "3", name: "LOCK_ECC_CFG", type: "RW", description: "Lock the CC ECC Configuration Bit. 0: Disable, 1: Enable. If set to 1, previous bits can't be changed." },
          { bits: "4", name: "LOCK_ECC_ERR_INJ", type: "RW", description: "Lock CC ECC Error Injection Register. 0: Disable, 1: Enable." },
          { bits: "5", name: "RECV_ERR_IRQ_EN", type: "RW", description: "Enable the interrupt when recoverable error count exceeds the threshold. 0: Disable, 1: Enable" },
          { bits: "6", name: "FATAL_ERR_IRQ_EN", type: "RW", description: "Enable the interrupt when fatal error count exceeds the threshold. 0: Disable, 1: Enable" },
          { bits: "7", name: "BUS_ERR_PEND", type: "RO", description: "Indicate if there is Bus Error Pending of all type. 0: No Pending, 1: Pending." },
          { bits: "8", name: "BUS_ERR_IRQ_EN", type: "RW", description: "Enable the Bus Error interrupt of CC maintain operation. 0: Disable, 1: Enable" },
          { bits: "9", name: "SUP_CMD_EN", type: "RW", description: "Enable S Mode can operate register CC_sCMD and SMP_PMON_SEL. 0: Disable, 1: Enable" },
          { bits: "10", name: "USE_CMD_EN", type: "RW", description: "Enable U Mode can operate register CC_uCMD and SMP_PMON_SEL. 0: Disable, 1: Enable" },
          { bits: "11", name: "ECC_CHK_EN", type: "RW", description: "CC ECC Check Enable Bit. 0: Disable, 1: Enable" },
          { bits: "12", name: "CLM_ECC_EN", type: "RW", description: "CLM ECC Enable Bit. 0: Disable, 1: Enable" },
          { bits: "13", name: "CLM_EXCP_EN", type: "RW", description: "CLM ECC Exception Enable Bit. 0: Disable, 1: Enable" },
          { bits: "14", name: "CLM_ECC_CHK_EN", type: "RW", description: "CLM ECC Check Enable Bit. 0: Disable, 1: Enable" },
          { bits: "15", name: "PF_SH_CL_EN", type: "RW", description: "Enable L1 prefetch to snoop and share cacheline from other cores. 0: Disable, 1: Enable" },
          { bits: "16", name: "PF_L2_EARLY_EN", type: "RW", description: "Enable L2 prefetch to initialize external bus read access while lookup the cluster cache. 0: Disable, 1: Enable" },
          { bits: "17", name: "PF_BIU_OUTS_EN", type: "RW", description: "Enable the limit of outstanding L2 Prefetch. 0: Disable, 1: Enable" },
          { bits: "18", name: "I_SNOOP_D_EN", type: "RW", description: "Snoop to dcache for icache refill reads Enable. 0: Disable, 1: Enable (default in smp cores)" },
          { bits: "19", name: "IOCC_ERR", type: "RO", description: "IOCC Has error. 0: No error, 1: Error" },
          { bits: "20", name: "EARLY_WR_ERR", type: "RO", description: "Early write response has error. 0: No error, 1: Error" },
          { bits: "21", name: "PF_NO_WB", type: "RW", description: "Enable L2 prefetch to abort and avoid dirty cacheline write back. 0: Disable, 1: Enable" },
          { bits: "31:22", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_mCMD",
        description: "Machine Mode CC Command and Status. Sets specific maintain command for Cluster Cache and checks the command result in Machine Mode.",
        permission: "MRW",
        offset: "0x14",
        fields: [
          { bits: "4:0", name: "CMD", type: "RW", description: "Cluster Cache Maintain Command Code" },
          { bits: "22:5", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "23", name: "RESC", type: "RW", description: "Read as Recoverable ECC Error IRQ Pending, write 1 will clear CC_RECV_CNT." },
          { bits: "24", name: "FESC", type: "RW", description: "Read as Fatal ECC Error IRQ Pending, write 1 will clear CC_FATAL_CNT." },
          { bits: "25", name: "BESC", type: "RW", description: "Read as BUS_ERR_PEND, write 1 will clear BUS_ERR_PEND." },
          { bits: "30:26", name: "Result_Code", type: "RO", description: "Result of the CMD" },
          { bits: "31", name: "Complete", type: "RO", description: "Indicate the CMD complete or not. 0: Not Complete, 1: Complete" }
        ]
      },
      {
        name: "CC_ERR_INJ",
        description: "CC ECC Error Injection Control Register.",
        permission: "MRW",
        offset: "0x18",
        fields: [
          { bits: "0", name: "INJ_DATA", type: "RW", description: "Inject error to CC Data Ram" },
          { bits: "1", name: "INJ_TAG", type: "RW", description: "Inject error to CC Tag Ram" },
          { bits: "2", name: "INJ_CLM", type: "RW", description: "Inject error to CLM Ram" },
          { bits: "3", name: "INJ_MODE", type: "RW", description: "Indicate the software ecc code inject mode. 0: Direct Write Mode, 1: XOR Write Mode." },
          { bits: "4", name: "CS", type: "RW", description: "Precise injection error control and status. Write 1 to start, automatic cleared when finished." },
          { bits: "5", name: "PRCS", type: "RO", description: "Precise injection error flag." },
          { bits: "6", name: "NS", type: "RW", description: "Secure mode and Non secure mode. 0: secure mode, 1: non secure mode" },
          { bits: "23:7", name: "Reserved", type: "RO", description: "Reserved" },
          { bits: "31:24", name: "INJ_ECC_CODE", type: "RW", description: "The content which will be injected" }
        ]
      },
      {
        name: "CC_RECV_CNT",
        description: "CC ECC Recoverable Error Count Register. Counts the Cluster Cache ECC recoverable error events.",
        permission: "MRW",
        offset: "0x1C",
        fields: [
          { bits: "15:0", name: "CNT", type: "RW", description: "Count the recoverable error, it is saturated" },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_FATAL_CNT",
        description: "CC ECC Fatal Error Count Register. Counts the Cluster Cache ECC fatal error events.",
        permission: "MRW",
        offset: "0x20",
        fields: [
          { bits: "15:0", name: "CNT", type: "RW", description: "Count the fatal error, it is saturated" },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_RECV_THV",
        description: "CC ECC Recoverable Error Threshold Register. Sets the threshold value of Cluster Cache ECC recoverable errors.",
        permission: "MRW",
        offset: "0x24",
        fields: [
          { bits: "15:0", name: "THRESHOLD", type: "RW", description: "The threshold value of ECC recoverable error." },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_FATAL_THV",
        description: "CC ECC Fatal Error Threshold Register. Sets the threshold value of Cluster Cache ECC fatal error.",
        permission: "MRW",
        offset: "0x28",
        fields: [
          { bits: "15:0", name: "THRESHOLD", type: "RW", description: "The threshold value of ECC fatal error." },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_BUS_ERR_ADDR",
        description: "CC Maintain Operate Bus Error Physical Address. Records the Physical Address when CC Management Operation causes Bus Error.",
        permission: "MRW",
        offset: "0x2C",
        fields: [
          { bits: "5:0", name: "CONST_0", type: "RO", description: "Constant 0. Width depends on cache line size." },
          { bits: "63:6", name: "ERR_ADDR", type: "RW", description: "The error address when Bus Error happens." }
        ]
      },
      {
        "name": "CLIENT0_ERR_STATUS",
        "description": "Client0 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x40",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT1_ERR_STATUS",
        "description": "Client1 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x44",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT2_ERR_STATUS",
        "description": "Client2 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x48",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT3_ERR_STATUS",
        "description": "Client3 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x4C",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT4_ERR_STATUS",
        "description": "Client4 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x50",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT5_ERR_STATUS",
        "description": "Client5 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x54",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT6_ERR_STATUS",
        "description": "Client6 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x58",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT7_ERR_STATUS",
        "description": "Client7 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x5C",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT8_ERR_STATUS",
        "description": "Client8 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x60",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT9_ERR_STATUS",
        "description": "Client9 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x64",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT10_ERR_STATUS",
        "description": "Client10 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x68",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT11_ERR_STATUS",
        "description": "Client11 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x6C",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT12_ERR_STATUS",
        "description": "Client12 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x70",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT13_ERR_STATUS",
        "description": "Client13 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x74",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT14_ERR_STATUS",
        "description": "Client14 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x78",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT15_ERR_STATUS",
        "description": "Client15 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x7C",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT16_ERR_STATUS",
        "description": "Client16 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x80",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT17_ERR_STATUS",
        "description": "Client17 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x84",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT18_ERR_STATUS",
        "description": "Client18 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x88",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT19_ERR_STATUS",
        "description": "Client19 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x8C",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT20_ERR_STATUS",
        "description": "Client20 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x90",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT21_ERR_STATUS",
        "description": "Client21 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x94",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT22_ERR_STATUS",
        "description": "Client22 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x98",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT23_ERR_STATUS",
        "description": "Client23 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0x9C",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT24_ERR_STATUS",
        "description": "Client24 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xA0",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT25_ERR_STATUS",
        "description": "Client25 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xA4",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT26_ERR_STATUS",
        "description": "Client26 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xA8",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT27_ERR_STATUS",
        "description": "Client27 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xAC",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT28_ERR_STATUS",
        "description": "Client28 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xB0",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT29_ERR_STATUS",
        "description": "Client29 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xB4",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT30_ERR_STATUS",
        "description": "Client30 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xB8",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },
      {
        "name": "CLIENT31_ERR_STATUS",
        "description": "Client31 of CC Error Status. Records the detail error type for the client.",
        "permission": "MRW",
        "offset": "0xBC",
        "fields": [
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "3", name: "IOCP_BUS_ERR", type: "RW", description: "The error type is IOCP Bus response error. Only applies to clients hooked to IOCP Ports." },
          { bits: "2", name: "CC_SCU_ECC_ERR", type: "RW", description: "The error type is cluster cache tag/data, SCU shadow tag or snoop L1 access ECC error." },
          { bits: "1", name: "WRITE_BUS_ERR", type: "RW", description: "The error type is write bus error." },
          { bits: "0", name: "READ_BUS_ERR", type: "RW", description: "The error type is read bus error." }
        ]
      },

     {
        name: "CC_sCMD",
        description: "Supervisor Mode CC Command and Status. Sets specific maintain command for Cluster Cache and checks the command result in Supervisor Mode.",
        permission: "SRW",
        offset: "0xC0",
        fields: [
          { bits: "4:0", name: "CMD", type: "RW", description: "Cluster Cache Maintain Command Code" },
          { bits: "22:5", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "23", name: "RESC", type: "RW", description: "Read as Recoverable ECC Error IRQ Pending, write 1 will clear CC_RECV_CNT." },
          { bits: "24", name: "FESC", type: "RW", description: "Read as Fatal ECC Error IRQ Pending, write 1 will clear CC_FATAL_CNT." },
          { bits: "25", name: "BESC", type: "RW", description: "Read as BUS_ERR_PEND, write 1 will clear BUS_ERR_PEND." },
          { bits: "30:26", name: "RESULT_CODE", type: "RO", description: "Result of the CMD" },
          { bits: "31", name: "Complete", type: "RO", description: "Indicate the CMD complete or not. 0: Not Complete, 1: Complete" }
        ]
      },
      
      {
        name: "CC_uCMD",
        description: "User Mode CC Command and Status. Sets specific maintain command for Cluster Cache and checks the command result in User Mode.",
        permission: "URW",
        offset: "0xC4",
        fields: [
          { bits: "4:0", name: "CMD", type: "RW", description: "Cluster Cache Maintain Command Code" },
          { bits: "22:5", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "23", name: "RESC", type: "RW", description: "Read as Recoverable ECC Error IRQ Pending, write 1 will clear CC_RECV_CNT." },
          { bits: "24", name: "FESC", type: "RW", description: "Read as Fatal ECC Error IRQ Pending, write 1 will clear CC_FATAL_CNT." },
          { bits: "25", name: "BESC", type: "RW", description: "Read as BUS_ERR_PEND, write 1 will clear BUS_ERR_PEND." },
          { bits: "30:26", name: "RESULT_CODE", type: "RO", description: "Result of the CMD" },
          { bits: "31", name: "Complete", type: "RO", description: "Indicate the CMD complete or not. 0: Not Complete, 1: Complete" }
        ]
      },
      {
        name: "SNOOP_PENDING",
        description: "Indicate the Core is being snooped or not in the SCU.",
        permission: "MR",
        offset: "0xC8",
        fields: [
          { bits: "15:0", name: "SNOOP_PENDING", type: "RO", description: "Snoop pending bit for each client in the cluster." },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "TRANS_PENDING",
        description: "Indicate the Core's transaction finish or not in the SCU.",
        permission: "MR",
        offset: "0xCC",
        fields: [
          { bits: "15:0", name: "TRANS_PENDING", type: "RO", description: "Transaction pending bit for each core in the cluster." },
          { bits: "30:16", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "31", name: "EXT_TRANS", type: "RO", description: "External Memory Bus Transaction pending bit." }
        ]
      },
      {
        name: "CLM_ADDR_BASE",
        description: "Cluster Local Memory base address register. Sets the base address of CLM. Aligned to Cluster Cache size.",
        permission: "MRW",
        offset: "0xD0",
        fields: [
          { bits: "63:0", name: "ADDR", type: "RW", description: "The base address of CLM." }
        ]
      },
      {
        name: "CLM_WAY_EN",
        description: "Cluster Cache way enable register for Cluster Local Memory. Sets the data ram of Cluster Cache to be used as CLM.",
        permission: "MRW",
        offset: "0xD8",
        fields: [
          { bits: "15:0", name: "ENA", type: "RW", description: "This way is used as CLM or not." },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "CC_INVALID_ALL",
        description: "Cluster Cache invalid all register. Invalidates all Cluster Cache without affecting CLM.",
        permission: "MRW",
        offset: "0xDC",
        fields: [
          { bits: "0", name: "CS", type: "W", description: "Write 1 will invalid all Cluster Cache, hardware clears when done." },
          { bits: "31:1", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "STM_CTRL",
        description: "Stream read/write control register.",
        permission: "MRW",
        offset: "0xE0",
        fields: [
          { bits: "0", name: "RD_STM_EN", type: "RW", description: "Read stream Enable." },
          { bits: "1", name: "WR_STM_EN", type: "RW", description: "Write stream Enable." },
          { bits: "2", name: "TRANS_ALLOC", type: "RW", description: "Translate allocate attribute to non-alloc attribute Enable." },
          { bits: "3", name: "RD_MERGE_EN", type: "RW", description: "Non-cacheable attribute read merge Enable." },
          { bits: "4", name: "CROSS_EN", type: "RW", description: "Read stream cross 4K enable." },
          { bits: "31:5", name: "Reserved", type: "RO", description: "Reserved 0" }
        ]
      },
      {
        name: "STM_CFG",
        description: "Stream read/write configuration register.",
        permission: "MRW",
        offset: "0xE4",
        fields: [
          { bits: "9:0", name: "RD_BYTE_THRE", type: "RW", description: "The prefetch number for Read stream." },
          { bits: "11:10", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "14:12", name: "RD_DEGREE", type: "RW", description: "The delta between prefetch address and current bus address." },
          { bits: "15", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "18:16", name: "RD_DISTANCE", type: "RW", description: "The threshold bytes number matching write stream training successfully." },
          { bits: "19", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "29:20", name: "WR_BYTE_THRE", type: "RW", description: "The line buff timeout free time when no same cacheline transaction." },
          { bits: "31:30", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      },
      {
        name: "STM_TIMEOUT",
        description: "Stream read/write timeout register.",
        permission: "MRW",
        offset: "0xE8",
        fields: [
          { bits: "10:0", name: "TIMEOUT", type: "RW", description: "write streaming wait clk num" },
          { bits: "31:11", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      },
      {
        name: "DFF_PROT",
        description: "Hardware Register protect Enable register.",
        permission: "MRW",
        offset: "0xEC",
        fields: [
          { bits: "1:0", name: "CHK_EN", type: "RW", description: "Register protect check enable. 2'b01: Disable, 2'b10: Enable, Other: illegal value." },
          { bits: "31:2", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      },
      {
        name: "ECC_ERR_MSK",
        description: "Mask L2M ECC Error to ecc_cc_error_masked or safety_error output.",
        permission: "MRW",
        offset: "0xF0",
        fields: [
          { bits: "0", name: "CC_L2_ERR_MSK", type: "RW", description: "Mask L2 double bit error output. 0: Not mask, 1: Mask" },
          { bits: "1", name: "CC_CORE_ERR_MASK", type: "RW", description: "Mask Core double bit error output. 0: Not mask, 1: Mask" },
          { bits: "31:2", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      },
      {
        name: "NS_RG0",
        description: "Non-Sharable Memory Region 0 register.",
        permission: "MRW",
        offset: "0x100",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG1",
        description: "Non-Sharable Memory Region 1 register.",
        permission: "MRW",
        offset: "0x108",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG2",
        description: "Non-Sharable Memory Region 2 register.",
        permission: "MRW",
        offset: "0x110",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG3",
        description: "Non-Sharable Memory Region 3 register.",
        permission: "MRW",
        offset: "0x118",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG4",
        description: "Non-Sharable Memory Region 4 register.",
        permission: "MRW",
        offset: "0x120",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG5",
        description: "Non-Sharable Memory Region 5 register.",
        permission: "MRW",
        offset: "0x128",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG6",
        description: "Non-Sharable Memory Region 6 register.",
        permission: "MRW",
        offset: "0x130",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG7",
        description: "Non-Sharable Memory Region 7 register.",
        permission: "MRW",
        offset: "0x138",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG8",
        description: "Non-Sharable Memory Region 8 register.",
        permission: "MRW",
        offset: "0x140",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG9",
        description: "Non-Sharable Memory Region 9 register.",
        permission: "MRW",
        offset: "0x148",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG10",
        description: "Non-Sharable Memory Region 10 register.",
        permission: "MRW",
        offset: "0x150",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG11",
        description: "Non-Sharable Memory Region 11 register.",
        permission: "MRW",
        offset: "0x158",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG12",
        description: "Non-Sharable Memory Region 12 register.",
        permission: "MRW",
        offset: "0x160",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG13",
        description: "Non-Sharable Memory Region 13 register.",
        permission: "MRW",
        offset: "0x168",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG14",
        description: "Non-Sharable Memory Region 14 register.",
        permission: "MRW",
        offset: "0x170",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "NS_RG15",
        description: "Non-Sharable Memory Region 15 register.",
        permission: "MRW",
        offset: "0x178",
        fields: [
          { bits: "63:6", name: "ADDR", type: "RW", description: "Coding of address and space of the region" },
          { bits: "5:2", name: "CONSTANT_ZERO", type: "RO", description: "Constant 0. Granularity of the region equals to cacheline size." },
          { bits: "1:0", name: "CFG", type: "RW", description: "0: Disable this region; 2: NACL; 3: NAPOT." }
        ]
      },
      {
        name: "SMP_PMON_SEL0",
        description: "Performance Monitor Event Selector 0. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x180",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL1",
        description: "Performance Monitor Event Selector 1. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x184",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL2",
        description: "Performance Monitor Event Selector 2. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x188",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL3",
        description: "Performance Monitor Event Selector 3. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x18C",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL4",
        description: "Performance Monitor Event Selector 4. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x190",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL5",
        description: "Performance Monitor Event Selector 5. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x194",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL6",
        description: "Performance Monitor Event Selector 6. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x198",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL7",
        description: "Performance Monitor Event Selector 7. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x19C",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL8",
        description: "Performance Monitor Event Selector 8. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1A0",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL9",
        description: "Performance Monitor Event Selector 9. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1A4",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL10",
        description: "Performance Monitor Event Selector 10. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1A8",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL11",
        description: "Performance Monitor Event Selector 11. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1AC",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL12",
        description: "Performance Monitor Event Selector 12. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1B0",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL13",
        description: "Performance Monitor Event Selector 13. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1B4",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL14",
        description: "Performance Monitor Event Selector 14. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1B8",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_SEL15",
        description: "Performance Monitor Event Selector 15. Selects Cluster Cache micro-architecture event to monitor performance.",
        permission: "MRW",
        offset: "0x1BC",
        fields: [
          { bits: "31:21", name: "Reserved", type: "RO", description: "Reserved 0" },
          { bits: "20:16", name: "CLIENT_SEL", type: "RW", description: "Specify the core in the cluster or external master number hooked to I/O Coherency Port" },
          { bits: "15:0", name: "EVENT_SEL", type: "RW", description: "Select the event for this Performance Monitor Counter" }
        ]
      },
      {
        name: "SMP_PMON_CNT0",
        description: "Performance Monitor Event Counter 0. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1C0",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT1",
        description: "Performance Monitor Event Counter 1. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1C8",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT2",
        description: "Performance Monitor Event Counter 2. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1D0",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT3",
        description: "Performance Monitor Event Counter 3. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1D8",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT4",
        description: "Performance Monitor Event Counter 4. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1E0",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT5",
        description: "Performance Monitor Event Counter 5. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1E8",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT6",
        description: "Performance Monitor Event Counter 6. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1F0",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT7",
        description: "Performance Monitor Event Counter 7. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x1F8",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT8",
        description: "Performance Monitor Event Counter 8. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x200",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT9",
        description: "Performance Monitor Event Counter 9. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x208",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT10",
        description: "Performance Monitor Event Counter 10. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x210",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT11",
        description: "Performance Monitor Event Counter 11. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x218",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT12",
        description: "Performance Monitor Event Counter 12. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x220",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT13",
        description: "Performance Monitor Event Counter 13. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x228",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT14",
        description: "Performance Monitor Event Counter 14. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x230",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "SMP_PMON_CNT15",
        description: "Performance Monitor Event Counter 15. Counts the event as the corresponding selector register selects.",
        permission: "MRW",
        offset: "0x238",
        fields: [
          { bits: "63:0", name: "CNT", type: "RW", description: "If the event selected happens once, the value adds 1. Overflow sets Overflow bit in selector register." }
        ]
      },
      {
        name: "CLIENT0_ERR_ADDR",
        description: "The register of address of client0 which causes error.",
        permission: "MRW",
        offset: "0x280",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT1_ERR_ADDR",
        description: "The register of address of client1 which causes error.",
        permission: "MRW",
        offset: "0x288",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT2_ERR_ADDR",
        description: "The register of address of client2 which causes error.",
        permission: "MRW",
        offset: "0x290",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT3_ERR_ADDR",
        description: "The register of address of client3 which causes error.",
        permission: "MRW",
        offset: "0x298",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT4_ERR_ADDR",
        description: "The register of address of client4 which causes error.",
        permission: "MRW",
        offset: "0x2A0",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT5_ERR_ADDR",
        description: "The register of address of client5 which causes error.",
        permission: "MRW",
        offset: "0x2A8",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT6_ERR_ADDR",
        description: "The register of address of client6 which causes error.",
        permission: "MRW",
        offset: "0x2B0",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT7_ERR_ADDR",
        description: "The register of address of client7 which causes error.",
        permission: "MRW",
        offset: "0x2B8",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT8_ERR_ADDR",
        description: "The register of address of client8 which causes error.",
        permission: "MRW",
        offset: "0x2C0",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT9_ERR_ADDR",
        description: "The register of address of client9 which causes error.",
        permission: "MRW",
        offset: "0x2C8",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT10_ERR_ADDR",
        description: "The register of address of client10 which causes error.",
        permission: "MRW",
        offset: "0x2D0",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT11_ERR_ADDR",
        description: "The register of address of client11 which causes error.",
        permission: "MRW",
        offset: "0x2D8",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT12_ERR_ADDR",
        description: "The register of address of client12 which causes error.",
        permission: "MRW",
        offset: "0x2E0",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT13_ERR_ADDR",
        description: "The register of address of client13 which causes error.",
        permission: "MRW",
        offset: "0x2E8",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT14_ERR_ADDR",
        description: "The register of address of client14 which causes error.",
        permission: "MRW",
        offset: "0x2F0",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT15_ERR_ADDR",
        description: "The register of address of client15 which causes error.",
        permission: "MRW",
        offset: "0x2F8",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT16_ERR_ADDR",
        description: "The register of address of client16 which causes error.",
        permission: "MRW",
        offset: "0x300",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT17_ERR_ADDR",
        description: "The register of address of client17 which causes error.",
        permission: "MRW",
        offset: "0x308",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT18_ERR_ADDR",
        description: "The register of address of client18 which causes error.",
        permission: "MRW",
        offset: "0x310",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT19_ERR_ADDR",
        description: "The register of address of client19 which causes error.",
        permission: "MRW",
        offset: "0x318",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT20_ERR_ADDR",
        description: "The register of address of client20 which causes error.",
        permission: "MRW",
        offset: "0x320",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT21_ERR_ADDR",
        description: "The register of address of client21 which causes error.",
        permission: "MRW",
        offset: "0x328",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT22_ERR_ADDR",
        description: "The register of address of client22 which causes error.",
        permission: "MRW",
        offset: "0x330",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT23_ERR_ADDR",
        description: "The register of address of client23 which causes error.",
        permission: "MRW",
        offset: "0x338",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT24_ERR_ADDR",
        description: "The register of address of client24 which causes error.",
        permission: "MRW",
        offset: "0x340",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT25_ERR_ADDR",
        description: "The register of address of client25 which causes error.",
        permission: "MRW",
        offset: "0x348",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT26_ERR_ADDR",
        description: "The register of address of client26 which causes error.",
        permission: "MRW",
        offset: "0x350",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT27_ERR_ADDR",
        description: "The register of address of client27 which causes error.",
        permission: "MRW",
        offset: "0x358",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT28_ERR_ADDR",
        description: "The register of address of client28 which causes error.",
        permission: "MRW",
        offset: "0x360",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT29_ERR_ADDR",
        description: "The register of address of client29 which causes error.",
        permission: "MRW",
        offset: "0x368",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT30_ERR_ADDR",
        description: "The register of address of client30 which causes error.",
        permission: "MRW",
        offset: "0x370",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT31_ERR_ADDR",
        description: "The register of address of client31 which causes error.",
        permission: "MRW",
        offset: "0x378",
        fields: [
          { bits: "63:0", name: "ERR_ADDR", type: "RW", description: "The error address when Error happens for the client." }
        ]
      },
      {
        name: "CLIENT0_WAY_MASK",
        description: "Cluster Cache way mask control register for client0. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x380",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT1_WAY_MASK",
        description: "Cluster Cache way mask control register for client1. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x384",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT2_WAY_MASK",
        description: "Cluster Cache way mask control register for client2. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x388",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT3_WAY_MASK",
        description: "Cluster Cache way mask control register for client3. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x38C",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT4_WAY_MASK",
        description: "Cluster Cache way mask control register for client4. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x390",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT5_WAY_MASK",
        description: "Cluster Cache way mask control register for client5. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x394",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT6_WAY_MASK",
        description: "Cluster Cache way mask control register for client6. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x398",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT7_WAY_MASK",
        description: "Cluster Cache way mask control register for client7. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x39C",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT8_WAY_MASK",
        description: "Cluster Cache way mask control register for client8. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3A0",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT9_WAY_MASK",
        description: "Cluster Cache way mask control register for client9. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3A4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT10_WAY_MASK",
        description: "Cluster Cache way mask control register for client10. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3A8",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT11_WAY_MASK",
        description: "Cluster Cache way mask control register for client11. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3AC",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT12_WAY_MASK",
        description: "Cluster Cache way mask control register for client12. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3B0",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT13_WAY_MASK",
        description: "Cluster Cache way mask control register for client13. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3B4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT14_WAY_MASK",
        description: "Cluster Cache way mask control register for client14. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3B8",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT15_WAY_MASK",
        description: "Cluster Cache way mask control register for client15. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3BC",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT16_WAY_MASK",
        description: "Cluster Cache way mask control register for client16. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3C0",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT17_WAY_MASK",
        description: "Cluster Cache way mask control register for client17. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3C4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT18_WAY_MASK",
        description: "Cluster Cache way mask control register for client18. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3C8",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT19_WAY_MASK",
        description: "Cluster Cache way mask control register for client19. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3CC",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT20_WAY_MASK",
        description: "Cluster Cache way mask control register for client20. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3D0",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT21_WAY_MASK",
        description: "Cluster Cache way mask control register for client21. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3D4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT22_WAY_MASK",
        description: "Cluster Cache way mask control register for client22. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3D8",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT23_WAY_MASK",
        description: "Cluster Cache way mask control register for client23. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3DC",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT24_WAY_MASK",
        description: "Cluster Cache way mask control register for client24. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3E0",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT25_WAY_MASK",
        description: "Cluster Cache way mask control register for client25. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3E4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT26_WAY_MASK",
        description: "Cluster Cache way mask control register for client26. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3E8",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT27_WAY_MASK",
        description: "Cluster Cache way mask control register for client27. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3EC",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT28_WAY_MASK",
        description: "Cluster Cache way mask control register for client28. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3F0",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT29_WAY_MASK",
        description: "Cluster Cache way mask control register for client29. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3F4",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT30_WAY_MASK",
        description: "Cluster Cache way mask control register for client30. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3F8",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CLIENT31_WAY_MASK",
        description: "Cluster Cache way mask control register for client31. Sets the Cluster Cache ways which can be used by the client.",
        permission: "MRW",
        offset: "0x3FC",
        fields: [
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." },
          { bits: "15:0", name: "MASK", type: "RW", description: "Mask this way for the client. If bit n is 1, this way can't be used by this client." }
        ]
      },
      {
        name: "CC_INV_RANGE",
        description: "Cluster invalidate address range control and status.",
        permission: "MRW",
        offset: "0x720",
        fields: [
          { bits: "0", name: "CS", type: "RW", description: "Write 1 to start inv range, automatic cleared when finished." },
          { bits: "31:1", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      },
      {
        name: "CC_INV_RANGE_START",
        description: "Cluster invalidate address range start address.",
        permission: "MRW",
        offset: "0x724",
        fields: [
          { bits: "63:0", name: "ADDR", type: "RW", description: "Set inv range start address." }
        ]
      },
      {
        name: "CC_INV_RANGE_END",
        description: "Cluster invalidate address range end address.",
        permission: "MRW",
        offset: "0x72C",
        fields: [
          { bits: "63:0", name: "ADDR", type: "RW", description: "Set inv range end address." }
        ]
      },
      {
        name: "CC_ECC_INJ_WAY",
        description: "Precise injection error WAY number. Must be one-hot encoding.",
        permission: "MRW",
        offset: "0x740",
        fields: [
          { bits: "15:0", name: "NUM", type: "RW", description: "Set precise ecc inject way number. (Must one-hot)" },
          { bits: "31:16", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      },
      {
        name: "CC_ECC_INJ_ADDR",
        description: "Precise injection error address.",
        permission: "MRW",
        offset: "0x744",
        fields: [
          { bits: "63:0", name: "ADDR", type: "RW", description: "Set precise ecc inject address." }
        ]
      },
      {
        name: "CC_ECC_INJ_DATA",
        description: "Precise injection error data.",
        permission: "MRW",
        offset: "0x74C",
        fields: [
          { bits: "31:0", name: "DATA", type: "RW", description: "Set precise ecc inject data." }
        ]
      },
      {
        name: "IOCP_ATTR_RMP",
        description: "Iocp attribute remap register. Sets iocp read and write operation attribute remap.",
        permission: "MRW",
        offset: "0x750",
        fields: [
          { bits: "0", name: "WR_RMP_EN", type: "RW", description: "Set write trans attribute remap enable." },
          { bits: "1", name: "WR_ATTRI", type: "RW", description: "Remap allocate and non-alloc. 0: Remap non-alloc to allocate, 1: Remap allocate to non-alloc" },
          { bits: "2", name: "RD_RMP_EN", type: "RW", description: "Set read trans attribute remap enable." },
          { bits: "3", name: "RD_ATTRI", type: "RW", description: "Remap allocate and non-alloc. 0: Remap non-alloc to allocate, 1: Remap allocate to non-alloc" },
          { bits: "31:4", name: "Reserved", type: "RO", description: "Reserved 0." }
        ]
      }
    ]
  },
  {
    unit: "cidu",
    offset: "0x50000",
    size: "64KB",
    description: "Address space of CIDU unit. The Cluster Interrupt Distribution Unit (CIDU) is used to distribute external interrupts to the core's ECLIC, also provides Inter Core Interrupt (ICI) and Semaphores Mechanism.",
    regs: [
      {
        name: "CORE[i]_INT_STATUS",
        description: "Core[i] Inter Core Interrupt status register.",
        permission: "S*W1C/R",
        offset: "0x0+4*i",
        fields: [
          { bits: "core_num-1:0", name: "CORE[i]_INT_STATUS", type: "W1C/R", description: "Inter core interrupt status register of core i. Each bit can be cleared by writing 1." }
        ]
      },
      {
        name: "SEMAPHORE[i]",
        description: "Semaphore[i] Inter Core Interrupt Semaphore register. Useful for multi-core cluster without SMP enable.",
        permission: "S*RW",
        offset: "0x80+4*i",
        fields: [
          { bits: "3:0", name: "CORE_STATUS", type: "RW", description: "Reset value is 0xf, other value means the specific core owns the semaphore." },
          { bits: "9:4", name: "CLUSTER_STATUS", type: "RW", description: "Reset value is 0x3f, other value means the specific cluster owns the semaphore." },
          { bits: "31:10", name: "Reserved", type: "RO", description: "Reserved." }
        ]
      },
      {
        name: "ICI_SHADOW_REG",
        description: "ICI Interrupt source core ID and target core ID. Write Only register.",
        permission: "S*WO",
        offset: "0x3FFC",
        fields: [
          { bits: "core_num-1:0", name: "REV_CORE_ID", type: "WO", description: "The Core ID which receives this Inter Core Interrupt" },
          { bits: "core_num+15:16", name: "SEND_CORE_ID", type: "WO", description: "The Core ID which sends this Inter Core Interrupt" }
        ]
      },
      {
        name: "INT[i]_INDICATOR",
        description: "Indicate interrupt i can be received by which cores.",
        permission: "S*RW",
        offset: "0x4000+4*i",
        fields: [
          { bits: "core_num_1:0", name: "INT[i]_INDICATOR", type: "RW", description: "Each bit indicates the core can receive this interrupt or not. 1 means yes, 0 means no." }
        ]
      },
      {
        name: "INT[i]_MASK",
        description: "Mask the INT[i] to the cores or not when the INT[i] Indicator is on.",  
        permission: "S*RW",
        offset: "0x8000+4*i",
        fields: [
          { bits: "core_num_1:0", name: "INT[i]_MASK", type: "RW", description: "Each bit indicates it should mask the indicator bit or not. 1 means no, 0 means yes. Can only be written when its value is all 1 or be written as all 1." }
        ]
      },
      {
        name: "CORE_NUM",
        description: "Indicate the static configuration core num in the cluster.",
        permission: "S*RO",
        offset: "0xC084",
        fields: [
          { bits: "31:0", name: "CORE_NUM", type: "RO", description: "Static configuration core num in the cluster." }
        ]
      },
      {
        name: "INT_NUM",
        description: "Indicate the static configuration interrupt number.",
        permission: "S*RO",
        offset: "0xC090",
        fields: [
          { bits: "31:0", name: "INT_NUM", type: "RO", description: "Static configuration interrupt number." }
        ]
      },
      {
        name: "CIDU_SRW_CTRL",
        description: "Control S-mode can access this CIDU register or not. Only accessible by M-mode.",
        permission: "MRW",
        offset: "0xC09C",
        fields: [
          { bits: "31:1", name: "Reserved", type: "RO", description: "Reserved to 0." },
          { bits: "0", name: "SRW", type: "RW", description: "Control S-mode can read or write CIDU registers or not.<br>0: S-Mode can read/write all CIDU registers.<br>1: S-Mode can not read/write CIDU registers" }
        ]
      }
    ]
  },
  {
    unit: "plic",
    offset: "0x400_0000",
    size: "64MB",
    description: "Address space of PLIC unit. The Platform-Level Interrupt Controller (PLIC) is used for Linux capable applications or symmetric multi-processor (SMP) applications.",
    regs: [
      {
        name: "SOURCE[i]_PRIORITY",
        description: "Source priority registers for interrupt source i.",
        permission: "S*RW",
        offset: "0x000000 + 4*i",
        fields: [
          { bits: "31:0", name: "PRIORITY", type: "RW", description: "Priority for source i." }
        ]
      },
      {
        name: "PENDING[i]",
        description: "Interrupt pending bits for sources i*32 to i*32+31",
        permission: "S*RW",
        offset: "0x001000 + 4*i",
        fields: [
          { bits: "31:0", name: "PENDING", type: "RW", description: "Pending bits for sources i*32 to i*32+31." }
        ]
      },
      {
        name: "M_INT_ENABLE[i]",
        description: "M-mode interrupt enables for Hart 0, source i*32 to i*32+31.",
        permission: "MRW",
        offset: "0x002000 + 4*i",
        fields: [
          { bits: "31:0", name: "ENABLE", type: "RW", description: "M-mode enable bits for sources i*32 to i*32+31." }
        ]
      },
      {
        name: "S_INT_ENABLE[i]",
        description: "S-mode interrupt enables for Hart 0, source i*32 to i*32+31",
        permission: "SRW",
        offset: "0x002080 + 4*i",
        fields: [
          { bits: "31:0", name: "ENABLE", type: "RW", description: "S-mode enable bits for sources i*32 to i*32+31." }
        ]
      },
      {
        name: "M_PRIORITY_THRESHOLD",
        description: "M-mode priority threshold for Hart 0.",
        permission: "MRW",
        offset: "0x200000",
        fields: [
          { bits: "31:0", name: "THRESHOLD", type: "RW", description: "M-mode priority threshold." }
        ]
      },
      {
        name: "M_CLAIM_COMPLETE",
        description: "M-mode claim/complete register for Hart 0.",
        permission: "MRW",
        offset: "0x200004",
        fields: [
          { bits: "31:0", name: "CLAIM_COMPLETE", type: "RW", description: "Read to claim highest priority pending interrupt, write to complete." }
        ]
      },
      {
        name: "S_PRIORITY_THRESHOLD",
        description: "S-mode priority threshold for Hart 0.",
        permission: "SRW",
        offset: "0x201000",
        fields: [
          { bits: "31:0", name: "THRESHOLD", type: "RW", description: "S-mode priority threshold." }
        ]
      },
      {
        name: "S_CLAIM_COMPLETE",
        description: "S-mode claim/complete register for Hart 0.",
        permission: "SRW",
        offset: "0x201004",
        fields: [
          { bits: "31:0", name: "CLAIM_COMPLETE", type: "RW", description: "Read to claim highest priority pending interrupt, write to complete." }
        ]
      },
      {
        name: "plic_srw_ctrl",
        description: "Control S-mode can access PLIC registers or not. Only accessible by M-mode.",
        permission: "MRW",
        offset: "0x3FFFFFC",
        fields: [
          { bits: "31:1", name: "Reserved", type: "RO", description: "Reserved, ties to 0" },
          { bits: "0", name: "SRW", type: "RW", description: "Control S-mode can read or write PLIC registers or not.<br>0: S-Mode can read/write all PLIC registers.<br>1: S-Mode can not read/write PLIC registers" }
        ]
      }
    ]
  }
];